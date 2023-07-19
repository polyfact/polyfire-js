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
    tokenUsage: t.type({
        input: t.number,
        output: t.number,
    }),
});

async function generateWithTokenUsage(task: string): Promise<t.TypeOf<typeof ResultType>> {
    const res = await fetch(`${POLYFACT_ENDPOINT}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": POLYFACT_TOKEN,
        },
        body: JSON.stringify({ task }),
    }).then((res) => res.json());

    if (!ResultType.is(res)) {
        throw new GenerationError();
    }

    return res;
}

async function generate(task: string): Promise<string> {
    const res = await generateWithTokenUsage(task);

    return res.result;
}

export { generate, generateWithTokenUsage };
