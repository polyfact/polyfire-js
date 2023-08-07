import axios from "axios";
import * as t from "polyfact-io-ts";
import { Readable } from "readable-stream";
import WebSocket from "isomorphic-ws";
import { ClientOptions, InputClientOptions, defaultOptions } from "./clientOpts";
import { Memory } from "./memory";

class GenerationError extends Error {
    errorType?: string;

    constructor(errorType?: string) {
        switch (errorType) {
            case "llm_init_failed":
                super("The server failed to initialize its LLM.");
                break;
            case "generation_failed":
                super("The generation failed.");
                break;
            default:
                super("An unknown error occured");
                break;
        }
        this.errorType = errorType || "unknown_error";
    }
}

const ResultType = t.type({
    result: t.string,
    token_usage: t.type({
        input: t.number,
        output: t.number,
    }),
});

export type GenerationOptions = {
    provider?: "openai" | "cohere" | "llama";
    chatId?: string;
    memory?: Memory;
    memoryId?: string;
    stop?: string[];
};

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<{ result: string; tokenUsage: { input: number; output: number } }> {
    const { token, endpoint } = await defaultOptions(clientOptions);
    const requestBody: {
        task: string;
        // eslint-disable-next-line camelcase
        memory_id?: string;
        // eslint-disable-next-line camelcase
        chat_id?: string;
        provider: GenerationOptions["provider"];
        stop: GenerationOptions["stop"];
    } = {
        task,
        provider: options?.provider || "openai",
        memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
        chat_id: options?.chatId || "",
        stop: options?.stop || [],
    };

    try {
        const res = await axios.post(`${endpoint}/generate`, requestBody, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        });

        const responseData = res.data;

        if (!ResultType.is(responseData)) {
            throw new GenerationError();
        }

        return { result: responseData.result, tokenUsage: responseData.token_usage };
    } catch (e) {
        if (e instanceof Error) {
            throw new GenerationError(e.name);
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

export function generateStream(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
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
        } = {
            task,
            provider: options?.provider || "openai",
            memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
            chat_id: options?.chatId || "",
            stop: options?.stop || [],
        };

        const { token, endpoint } = await defaultOptions(clientOptions);
        const ws = new WebSocket(`${endpoint.replace("http", "ws")}/stream?token=${token}`);

        ws.onopen = () => ws.send(JSON.stringify(requestBody));

        ws.onmessage = (data: any) => {
            if (data.data === "") {
                resultStream.push(null);
            } else {
                resultStream.push(data.data);
            }
        };
    })();
    return resultStream;
}

export default function client(clientOptions: InputClientOptions = {}) {
    return {
        generateWithTokenUsage: (task: string, options: GenerationOptions = {}) =>
            generateWithTokenUsage(task, options, clientOptions),
        generate: (task: string, options: GenerationOptions = {}) =>
            generate(task, options, clientOptions),
        generateStream: (task: string, options: GenerationOptions = {}) =>
            generateStream(task, options, clientOptions),
    };
}
