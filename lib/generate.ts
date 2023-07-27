import axios from "axios";
import * as t from "polyfact-io-ts";
import { ensurePolyfactToken } from "./helpers/ensurePolyfactToken";
import { Memory } from "./memory";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com", POLYFACT_TOKEN = "" } = process.env;

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
};

async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions = {},
): Promise<{ result: string; tokenUsage: { input: number; output: number } }> {
    ensurePolyfactToken();

    const requestBody: {
        task: string;
        // eslint-disable-next-line camelcase
        memory_id?: string;
        // eslint-disable-next-line camelcase
        chat_id?: string;
        provider: GenerationOptions["provider"];
    } = {
        task,
        provider: options?.provider || "openai",
        memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
        chat_id: options?.chatId || "",
    };

    try {
        const res = await axios.post(`${POLYFACT_ENDPOINT}/generate`, requestBody, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": POLYFACT_TOKEN,
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

async function generate(task: string, options: GenerationOptions = {}): Promise<string> {
    const res = await generateWithTokenUsage(task, options);

    return res.result;
}

export { generate, generateWithTokenUsage };
