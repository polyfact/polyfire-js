/* eslint-disable camelcase */

import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { Readable } from "readable-stream";
import WebSocket from "isomorphic-ws";
import { UUID } from "crypto";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { Memory } from "./memory";
import { ApiError, ErrorData } from "./helpers/error";

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

type ExclusiveProps = [{ systemPromptId?: UUID }, { systemPrompt?: string }];

export type SystemPrompt = ExclusiveN<ExclusiveProps>;

export type GenerationOptions = {
    provider?: "openai" | "cohere" | "llama" | "";
    model?: string;
    chatId?: string;
    memory?: Memory;
    memoryId?: string;
    stop?: string[];
    infos?: boolean;
} & SystemPrompt;

export type GenerationWithWebOptions = Omit<
    GenerationOptions,
    "chatId" | "memory" | "memoryId" | "stop" | "systemPromptId" | "systemPrompt"
> & { web: true };

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

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions,
    clientOptions?: InputClientOptions,
): Promise<GenerationResult>;
export async function generateWithTokenUsage(
    task: string,
    options: GenerationWithWebOptions,
    clientOptions?: InputClientOptions,
): Promise<GenerationResult>;

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions | GenerationWithWebOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<GenerationResult> {
    let requestBody = {};
    if ("web" in options) {
        requestBody = {
            task,
            provider: options.provider || "",
            model: options.model || "gpt-3.5-turbo",
            infos: options.infos || false,
            web: options.web,
        };
    } else {
        const genOptions = options as GenerationOptions;

        requestBody = {
            task,
            provider: genOptions.provider || "",
            model: genOptions.model || "gpt-3.5-turbo",
            memory_id: (await genOptions.memory?.memoryId) || genOptions.memoryId,
            chat_id: genOptions.chatId,
            stop: genOptions.stop || [],
            infos: genOptions.infos || false,
            system_prompt_id: genOptions.systemPromptId,
        };
    }

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
    options: GenerationOptions | GenerationWithWebOptions = {},
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
        let requestBody = {};
        if ("web" in options) {
            requestBody = {
                task,
                provider: options.provider || "",
                model: options.model || "gpt-3.5-turbo",
                infos: options.infos || false,
                web: options.web,
            };
        } else {
            requestBody = {
                task,
                provider: options?.provider || "",
                model: options?.model || "gpt-3.5-turbo",
                memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
                chat_id: options?.chatId || "",
                stop: options?.stop || [],
                infos: options?.infos || false,
                system_prompt_id: options?.systemPromptId,
            };
        }

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
                } else {
                    resultStream.push(data.data);
                }
            },
        );
    }
    return stream(task, options, clientOptions, (data: any, resultStream: GenerationStream) => {
        if (data.data === "") {
            resultStream.push(null);
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
    generate: (task: string, options?: GenerationOptions) => Promise<string | GenerationResult>;
    generateStream: (task: string, options?: GenerationOptions) => GenerationStream;
};

export default function client(clientOptions: InputClientOptions = {}): GenerationClient {
    return {
        generateWithTokenUsage: (task: string, options: GenerationOptions = {}) =>
            generateWithTokenUsage(task, options, clientOptions),
        generate: (task: string, options: GenerationOptions = {}) =>
            generate(task, options, clientOptions),
        generateStream: (task: string, options: GenerationOptions = {}) =>
            generateStream(task, options, clientOptions),
    };
}
