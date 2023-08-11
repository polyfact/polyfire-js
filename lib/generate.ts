import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { Readable } from "readable-stream";
import WebSocket from "isomorphic-ws";
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

export type GenerationOptions = {
    provider?: "openai" | "cohere" | "llama";
    chatId?: string;
    memory?: Memory;
    memoryId?: string;
    stop?: string[];
};

export type GenerationOptionsWithInfos = GenerationOptions & { infos?: boolean };

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

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptionsWithInfos = {},
    clientOptions: InputClientOptions = {},
): Promise<GenerationResult> {
    const { token, endpoint } = await defaultOptions(clientOptions);
    const requestBody: {
        task: string;
        // eslint-disable-next-line camelcase
        memory_id?: string;
        // eslint-disable-next-line camelcase
        chat_id?: string;
        provider: GenerationOptions["provider"];
        stop: GenerationOptions["stop"];
        infos: boolean;
    } = {
        task,
        provider: options?.provider || "openai",
        memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
        chat_id: options?.chatId || "",
        stop: options?.stop || [],
        infos: options?.infos || false,
    };

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

export async function generate(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<string> {
    const res = await generateWithTokenUsage(task, options, clientOptions);

    return res.result;
}

export async function generateWithInfo(
    task: string,
    options: GenerationOptionsWithInfos = {},
    clientOptions: InputClientOptions = {},
): Promise<GenerationResult> {
    options.infos = true;
    const res = await generateWithTokenUsage(task, options, clientOptions);

    return res;
}

function stream(
    task: string,
    options: GenerationOptionsWithInfos = {},
    clientOptions: InputClientOptions = {},
    onMessage: (data: any, resultStream: Readable) => void,
): Readable {
    const resultStream = new Readable({
        read() {},
    });
    (async () => {
        const requestBody: {
            task: string;
            // eslint-disable-next-line camelcase
            memory_id?: string;
            // eslint-disable-next-line camelcase
            chat_id?: string;
            provider: GenerationOptions["provider"];
            stop: GenerationOptions["stop"];
            infos?: boolean;
        } = {
            task,
            provider: options?.provider || "openai",
            memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
            chat_id: options?.chatId || "",
            stop: options?.stop || [],
            infos: options?.infos || false,
        };

        const { token, endpoint } = await defaultOptions(clientOptions);
        const ws = new WebSocket(`${endpoint.replace("http", "ws")}/stream?token=${token}`);

        ws.onopen = () => ws.send(JSON.stringify(requestBody));
        ws.onmessage = (data: any) => onMessage(data, resultStream);
    })();
    return resultStream;
}

export function generateStreamWithInfos(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Readable {
    return stream(
        task,
        { ...options, infos: true },
        clientOptions,
        (data: any, resultStream: Readable) => {
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

export function generateStream(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Readable {
    return stream(task, options, clientOptions, (data: any, resultStream: Readable) => {
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
    generate: (task: string, options?: GenerationOptions) => Promise<string>;
    generateWithInfo: (task: string, options?: GenerationOptions) => Promise<GenerationResult>;
    generateStream: (task: string, options?: GenerationOptions) => Readable;
    generateStreamWithInfos: (task: string, options?: GenerationOptions) => Readable;
};

export default function client(clientOptions: InputClientOptions = {}): GenerationClient {
    return {
        generateWithTokenUsage: (task: string, options: GenerationOptions = {}) =>
            generateWithTokenUsage(task, options, clientOptions),
        generate: (task: string, options: GenerationOptions = {}) =>
            generate(task, options, clientOptions),
        generateWithInfo: (task: string, options: GenerationOptions = {}) =>
            generateWithInfo(task, options, clientOptions),
        generateStream: (task: string, options: GenerationOptions = {}) =>
            generateStream(task, options, clientOptions),
        generateStreamWithInfos: (task: string, options: GenerationOptions = {}) =>
            generateStreamWithInfos(task, options, clientOptions),
    };
}
