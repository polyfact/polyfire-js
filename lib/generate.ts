import fetch from "node-fetch";
import * as t from "io-ts";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com" } = process.env;
const { POLYFACT_TOKEN = "" } = process.env;

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
};

async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions = {},
): Promise<{ result: string; tokenUsage: { input: number; output: number } }> {
    if (!POLYFACT_TOKEN) {
        throw new Error(
            "Please put your polyfact token in the POLYFACT_TOKEN environment variable. You can get one at https://app.polyfact.com",
        );
    }
    const res = await fetch(`${POLYFACT_ENDPOINT}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": POLYFACT_TOKEN,
        },
        body: JSON.stringify({ task, provider: options.provider || "openai" }),
    }).then((res) => res.json());

    if (!ResultType.is(res)) {
        throw new GenerationError();
    }

    return { result: res.result, tokenUsage: res.token_usage };
}

async function generate(task: string, options: GenerationOptions = {}): Promise<string> {
    const res = await generateWithTokenUsage(task, options);

    return res.result;
}

export { generate, generateWithTokenUsage };
