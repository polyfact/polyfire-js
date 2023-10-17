import axios, { AxiosError } from "axios";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

declare const window: Window | undefined;

class AudioTTS {
    audioCtx: AudioContext | null;

    constructor(public data: Buffer) {
        this.data = data;
        this.audioCtx = window ? new AudioContext() : null;
    }

    getMp3Buffer(): Buffer {
        return this.data;
    }

    getAudioBuffer(): Promise<AudioBuffer> {
        return new Promise((resolve) => {
            if (this.audioCtx) {
                const dst = new ArrayBuffer(this.data.byteLength);
                new Uint8Array(dst).set(new Uint8Array(this.data));
                this.audioCtx.decodeAudioData(dst, (buffer) => {
                    resolve(buffer);
                });
            } else {
                throw new Error("AudioContext is not supported in this environment");
            }
        });
    }

    async play(): Promise<void> {
        const buffer = await this.getAudioBuffer();
        return new Promise((resolve) => {
            const source = this.audioCtx!.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioCtx!.destination);
            source.start();
            source.onended = () => {
                resolve();
            };
        });
    }
}

export async function tts(
    text: string,
    { voice }: { voice?: string } = {},
    clientOptions: InputClientOptions = {},
): Promise<AudioTTS> {
    try {
        const { token, endpoint } = await defaultOptions(clientOptions);

        const res = await axios.post(
            `${endpoint}/tts`,
            { text, voice },
            {
                responseType: "arraybuffer",
                headers: {
                    "X-Access-Token": token,
                    "Content-Type": "application/json",
                },
            },
        );

        return new AudioTTS(res.data);
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export type TTSClient = {
    tts: (text: string, options?: { voice?: string }) => Promise<AudioTTS>;
};

export default function client(clientOptions: InputClientOptions = {}): TTSClient {
    return {
        tts: (text: string, options?: { voice?: string }) => tts(text, options, clientOptions),
    };
}
