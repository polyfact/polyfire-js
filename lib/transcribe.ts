import axios, { AxiosError } from "axios";
import { createClient } from "@supabase/supabase-js";
import * as t from "polyfact-io-ts";
import { FileInput, fileInputToBuffer } from "./utils";
import { InputClientOptions, defaultOptions, supabaseDefaultClient } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

const ResultType = t.intersection([
    t.type({
        text: t.string,
    }),
    t.partial({
        words: t.array(
            t.type({
                word: t.string,
                punctuated_word: t.string,
                start: t.number,
                end: t.number,
                confidence: t.number,
                speaker: t.number,
                speaker_confidence: t.number,
            }),
        ),
    }),
]);

function randomString() {
    const a = () => Math.floor(Math.random() * 1e16).toString(36);
    return a() + a() + a();
}

type TranscriptionOptions = {
    provider?: string;
};

type Word = {
    word: string;
    punctuatedWord: string;
    start: number;
    end: number;
    confidence: number;
    speaker: number;
    speakerConfidence: number;
};

export class Transcription implements Promise<string> {
    [Symbol.toStringTag] = "Transcription";

    private readonly promise: Promise<t.TypeOf<typeof ResultType>>;

    constructor(promise: Promise<t.TypeOf<typeof ResultType>>) {
        this.promise = promise;
    }

    then<TResult1 = string, TResult2 = never>(
        onfulfilled?: ((value: string) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled && (({ text }) => onfulfilled(text)), onrejected);
    }

    catch<TResult = never>(
        onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined,
    ): Promise<string | TResult> {
        return this.promise.then(({ text }) => text).catch(onrejected);
    }

    finally(onfinally?: (() => void) | null | undefined): Promise<string> {
        return this.promise.then(({ text }) => text).finally(onfinally);
    }

    async words(): Promise<Word[]> {
        const { text, words } = await this.promise;

        if (text && (!words || words.length === 0)) {
            console.warn(
                "No words found in transcription even though text has been transcribed. \nThis could indicate the provider you are using does not support word-level transcriptions. If you did not explicitely defined a provider when calling the transcribe function, the default provider is openai and does not support word level transcription.\nYou can switch to a provider like deepgram if you need word-level transcription. For more information check the polyfire documentation.",
            );
        }

        return (
            words?.map((word) => ({
                ...word,
                punctuatedWord: word.punctuated_word,
                speakerConfidence: word.speaker_confidence,
            })) ?? []
        );
    }
}

export function transcribe(
    file: FileInput,
    options: TranscriptionOptions = {},
    clientOptions: InputClientOptions = {},
    supabaseClient: { supabaseUrl: string; supabaseKey: string } = supabaseDefaultClient,
): Transcription {
    const promise = (async () => {
        try {
            const { token, endpoint } = await defaultOptions(clientOptions);

            const buf = await fileInputToBuffer(file);

            const supa = createClient(supabaseClient.supabaseUrl, supabaseClient.supabaseKey, {
                auth: { persistSession: false },
            });

            const fileName = randomString();

            await supa.storage.from("audio_transcribes").upload(fileName, buf);

            const res = await axios.post(
                `${endpoint}/transcribe`,
                { ...options, file_path: fileName },
                {
                    headers: {
                        "X-Access-Token": token,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!ResultType.is(res.data)) {
                throw new ApiError({
                    code: "mismatched_response",
                    message: "The response from the API does not match the expected format",
                });
            }

            return res.data;
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                throw new ApiError(e?.response?.data as ErrorData);
            }
            throw e;
        }
    })();

    return new Transcription(promise);
}

export type TranscribeClient = {
    transcribe: (file: FileInput, options?: TranscriptionOptions) => Transcription;
};

export default function client(clientOptions: InputClientOptions = {}): TranscribeClient {
    return {
        transcribe: (file: FileInput, options: TranscriptionOptions = {}) =>
            transcribe(file, options, clientOptions),
    };
}
