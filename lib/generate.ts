import axios from "axios";
import * as t from "polyfact-io-ts";
import { ClientOptions, defaultOptions } from "./clientOpts";
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
    provider?: "openai" | "cohere";
    chatId?: string;
    memory?: Memory;
    memoryId?: string;
    stop?: string[];
};

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions = {},
    clientOptions: Partial<ClientOptions> = {},
): Promise<{ result: string; tokenUsage: { input: number; output: number } }> {
    const { token, endpoint } = defaultOptions(clientOptions);
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
    clientOptions: Partial<ClientOptions> = {},
): Promise<string> {
    const res = await generateWithTokenUsage(task, options, clientOptions);

    return res.result;
}

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        generateWithTokenUsage: (task: string, options: GenerationOptions = {}) =>
            generateWithTokenUsage(task, options, clientOptions),
        generate: (task: string, options: GenerationOptions = {}) =>
            generate(task, options, clientOptions),
    };
}
