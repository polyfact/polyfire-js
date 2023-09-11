/* eslint-disable camelcase */
import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { Readable } from "readable-stream";
import WebSocket from "isomorphic-ws";
import { UUID } from "crypto";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { Memory } from "./memory";
import { ApiError, ErrorData } from "./helpers/error";
import { loaderToMemory, LoaderFunction } from "./dataloader";

const PartialResultType = t.partial({
    ressources: t.array(t.type({ id: t.string, content: t.string, similarity: t.number })),
});

const Required = t.type({
    result: t.string,
    token_usage: t.type({
        input: t.number,
        output: t.number,
    }),
});

const GenerationAPIResponse = t.intersection([Required, PartialResultType]);

export type Exclusive<T, U> =
    | (T & Partial<Record<Exclude<keyof U, keyof T>, never>>)
    | (U & Partial<Record<Exclude<keyof T, keyof U>, never>>);

export type ExclusiveN<T extends Record<string, unknown>[]> = T extends [infer F, ...infer Rest]
    ? F extends Record<string, unknown>
        ? Exclusive<F, ExclusiveN<Extract<Rest, Record<string, unknown>[]>>>
        : never
    : unknown;

export type AndN<T extends Record<string, unknown>[]> = T extends [infer F, ...infer Rest]
    ? F extends Record<string, unknown>
        ? Partial<F> & AndN<Extract<Rest, Record<string, unknown>[]>>
        : never
    : unknown;

export type NeverN<T extends Record<string, unknown>[]> = T extends [infer F, ...infer Rest]
    ? F extends Record<string, unknown>
        ? Partial<{ [x in keyof F]: never }> & NeverN<Extract<Rest, Record<string, unknown>[]>>
        : never
    : unknown;

export type Language =
    | "english"
    | "french"
    | "spanish"
    | "german"
    | "italian"
    | "portuguese"
    | "russian"
    | "mandarin"
    | "japanese"
    | "arabic"
    | "hindi"
    | "bengali"
    | "punjabi"
    | "javanese"
    | "swahili"
    | "korean"
    | "turkish"
    | "vietnamese"
    | "telugu"
    | "marathi"
    | "";

export type GenerationSimpleOptions = {
    provider?: "openai" | "cohere" | "llama" | "";
    model?: string;
    stop?: string[];
    temperature?: number;
    infos?: boolean;
    language?: Language;
};

export type ChatOptions = [{ chatId: string }, {}];

export type MemoryOptions = [
    { memoryId: string },
    { memory: Memory },
    { data: [LoaderFunction] | LoaderFunction },
    {},
];

export type SystemPromptOptions = [{ systemPromptId: UUID }, { systemPrompt: string }, {}];

export type GenerationWithWebOptions = GenerationSimpleOptions &
    NeverN<ChatOptions> &
    NeverN<MemoryOptions> &
    NeverN<SystemPromptOptions> & { web: true };

export type GenerationWithoutWebOptions = GenerationSimpleOptions &
    ExclusiveN<ChatOptions> &
    ExclusiveN<MemoryOptions> &
    ExclusiveN<SystemPromptOptions> & { web?: false };

export type GenerationOptions = GenerationWithWebOptions | GenerationWithoutWebOptions;

export type GenerationCompleteOptions = GenerationSimpleOptions &
    AndN<ChatOptions> &
    AndN<MemoryOptions> &
    AndN<SystemPromptOptions> & { web?: boolean };

export type TokenUsage = {
    input: number;
    output: number;
};

export type Ressource = {
    similarity: number;
    id: string;
    content: string;
};

export type GenerationResult = {
    result: string;
    tokenUsage: {
        input: number;
        output: number;
    };
    ressources?: Ressource[];
};

async function generateRequest(
    requestBody: Record<string, unknown>,
    clientOptions: InputClientOptions,
): Promise<GenerationResult> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.post(`${endpoint}/generate`, requestBody, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        });

        if (!GenerationAPIResponse.is(res.data)) {
            throw new ApiError({
                code: "mismatched_response",
                message: "The response from the API does not match the expected format",
            });
        }

        return {
            result: res.data.result,
            tokenUsage: res.data.token_usage,
            ressources: res.data.ressources,
        };
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

async function getMemoryIds(
    dataMemory: string | undefined,
    genOptionsMemoryId: string | undefined,
    genOptionsMemory: Memory | undefined,
): Promise<string[] | string | undefined> {
    const memoryIds: (string | undefined)[] = [
        dataMemory,
        genOptionsMemoryId,
        await genOptionsMemory?.memoryId,
    ];

    const validMemoryIds: string[] = memoryIds.filter((id): id is string => id !== undefined);

    if (validMemoryIds.length === 0) {
        return undefined;
    } else if (validMemoryIds.length >= 2) {
        return validMemoryIds;
    } else {
        return validMemoryIds[0];
    }
}

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions | GenerationWithWebOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<GenerationResult> {
    const genOptions = options as GenerationCompleteOptions;

    let dataMemory;
    if (genOptions.data) {
        dataMemory = await loaderToMemory(genOptions.data, clientOptions).then(
            (memory) => memory.memoryId,
        );
    }

    const memoryIdAssignment = await getMemoryIds(
        dataMemory,
        genOptions.memoryId,
        genOptions.memory,
    );

    const requestBody = {
        task,
        provider: genOptions.provider || "",
        model: genOptions.model,
        memory_id: memoryIdAssignment,
        stop: genOptions.stop || [],
        infos: genOptions.infos || false,
        system_prompt_id: genOptions.systemPromptId,
        temperature: genOptions.temperature,
        chat_id: genOptions.chatId,
        web: genOptions.web,
        language: genOptions.language,
    };

    return generateRequest(requestBody, clientOptions);
}

/**
 * Generates a result based on provided options.
 *
 * If `options.infos` is set to `true`, this function will return a `GenerationResult`.
 * If `options.infos` is set to `false` or left `undefined`, this function will return a `string`.
 *
 * @param task - The task string.
 * @param options - The generation options.
 * @param clientOptions - The client options.
 * @returns Either a `string` or a `GenerationResult` based on `options.infos`.
 */
export async function generate(
    task: string,
    options?: (GenerationOptions & { infos?: false | undefined }) | undefined,
    clientOptions?: InputClientOptions,
): Promise<string>;
export async function generate(
    task: string,
    options: GenerationOptions & { infos: true },
    clientOptions?: InputClientOptions,
): Promise<GenerationResult>;
export async function generate(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<string | GenerationResult> {
    const res = await generateWithTokenUsage(task, options, clientOptions);

    if (options?.infos) {
        return res;
    }

    return res.result;
}

export class GenerationStream extends Readable {
    stop: () => void;

    constructor({ stop }: { stop?: () => void } = {}) {
        super({ read() {}, objectMode: true });
        this.stop = stop || (() => {});
    }

    pipeInto(stream: GenerationStream): GenerationStream {
        this.on("infos", (data) => {
            stream.emit("infos", data);
        });
        this.on("data", (d) => {
            stream.push(d);
        });
        this.on("error", (data) => {
            stream.emit("error", data);
        });
        this.on("end", () => {
            stream.push(null);
        });
        stream.stop = () => this.stopWrap();

        return this;
    }

    stopWrap() {
        this.stop();
    }
}

function stream(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
    onMessage: (data: unknown, resultStream: GenerationStream) => void,
): GenerationStream {
    let stopped = false;
    const resultStream = new GenerationStream({
        stop: () => {
            stopped = true;
            resultStream.push(null);
        },
    });
    (async () => {
        const genOptions = options as GenerationCompleteOptions;
        let dataMemory;
        if (genOptions.data) {
            dataMemory = await loaderToMemory(genOptions.data, clientOptions).then(
                (memory) => memory.memoryId,
            );
        }

        const memoryIdAssignment = await getMemoryIds(
            dataMemory,
            genOptions.memoryId,
            genOptions.memory,
        );

        const requestBody = {
            task,
            provider: genOptions.provider || "",
            model: genOptions.model,
            memory_id: memoryIdAssignment,
            stop: genOptions.stop || [],
            infos: genOptions.infos || false,
            system_prompt_id: genOptions.systemPromptId,
            temperature: genOptions.temperature,
            chat_id: genOptions.chatId,
            web: genOptions.web,
            language: genOptions.language,
        };

        const { token, endpoint } = await defaultOptions(clientOptions);
        if (stopped) {
            return;
        }
        const ws = new WebSocket(`${endpoint.replace("http", "ws")}/stream?token=${token}`);

        ws.onopen = () => ws.send(JSON.stringify(requestBody));
        ws.onmessage = (data: unknown) => onMessage(data, resultStream);
        resultStream.stop = () => {
            ws.send("STOP");
        };
    })();
    return resultStream;
}

export function generateStream(
    task: string,
    options: GenerationOptions | GenerationWithWebOptions = {},
    clientOptions: InputClientOptions = {},
): GenerationStream {
    if (options.infos) {
        return stream(
            task,
            { ...options, infos: true },
            clientOptions,
            (data: any, resultStream: GenerationStream) => {
                if (data.data === "") {
                    resultStream.push(null);
                } else if (data.data.startsWith("[INFOS]:")) {
                    try {
                        const potentialRessources = JSON.parse(data.data.replace("[INFOS]:", ""));
                        resultStream.emit("infos", potentialRessources);
                    } catch (e) {
                        resultStream.push("");
                    }
                } else if (data.data.startsWith("[ERROR]:")) {
                    try {
                        const potentialRessources = JSON.parse(data.data.replace("[ERROR]:", ""));
                        resultStream.emit("error", potentialRessources);
                    } catch (e) {
                        resultStream.push("");
                    }
                } else {
                    resultStream.push(data.data);
                }
            },
        );
    }
    return stream(task, options, clientOptions, (data: any, resultStream: GenerationStream) => {
        if (data.data === "") {
            resultStream.push(null);
        } else if (data.data.startsWith("[ERROR]:")) {
            try {
                const potentialRessources = JSON.parse(data.data.replace("[ERROR]:", ""));
                resultStream.emit("error", potentialRessources);
            } catch (e) {
                resultStream.push("");
            }
        } else {
            resultStream.push(data.data);
        }
    });
}

export type GenerationClient = {
    generateWithTokenUsage: (
        task: string,
        options?: GenerationOptions,
    ) => Promise<GenerationResult>;
    generate: <T extends GenerationOptions>(
        task: string,
        options?: T,
    ) => Promise<T extends { infos: true } ? GenerationResult : string>;
    generateStream: (task: string, options?: GenerationOptions) => GenerationStream;
};

export default function client(clientOptions: InputClientOptions = {}): GenerationClient {
    return {
        generateWithTokenUsage: (task: string, options: GenerationOptions = {}) =>
            generateWithTokenUsage(task, options, clientOptions),
        generate: (task: string, options: GenerationOptions = {}) => {
            return generate(task, options as any, clientOptions) as any;
        },
        generateStream: (task: string, options: GenerationOptions = {}) =>
            generateStream(task, options, clientOptions),
    };
}
