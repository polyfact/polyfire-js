import axios from "axios";
import * as t from "polyfact-io-ts";
import { Readable } from "stream";
import WebSocket from "isomorphic-ws";
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
    provider?: "openai" | "cohere";
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
    clientOptions: Partial<ClientOptions> = {},
): Promise<GenerationResult> {
    const { token, endpoint } = defaultOptions(clientOptions);
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

        if (!GenerationAPIResponse.is(res)) {
            throw new GenerationError();
        }

        return {
            result: res.result,
            tokenUsage: res.token_usage,
            ressources: res.ressources,
        };
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

export async function generateWithInfo(
    task: string,
    options: GenerationOptionsWithInfos = {},
    clientOptions: Partial<ClientOptions> = {},
): Promise<GenerationResult> {
    options.infos = true;
    const res = await generateWithTokenUsage(task, options, clientOptions);

    return res;
}

function stream(
    task: string,
    options: GenerationOptionsWithInfos = {},
    clientOptions: Partial<ClientOptions> = {},
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

        const { token, endpoint } = defaultOptions(clientOptions);
        const ws = new WebSocket(`${endpoint.replace("http", "ws")}/stream?token=${token}`);

        ws.onopen = () => ws.send(JSON.stringify(requestBody));
        ws.onmessage = (data: any) => onMessage(data, resultStream);
    })();
    return resultStream;
}

export function generateStreamWithInfos(
    task: string,
    options: GenerationOptions = {},
    clientOptions: Partial<ClientOptions> = {},
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
    clientOptions: Partial<ClientOptions> = {},
): Readable {
    return stream(task, options, clientOptions, (data: any, resultStream: Readable) => {
        if (data.data === "") {
            resultStream.push(null);
        } else {
            resultStream.push(data.data);
        }
    });
}

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        generateWithTokenUsage: (task: string, options: GenerationOptions = {}) =>
            generateWithTokenUsage(task, options, clientOptions),
        generate: (task: string, options: GenerationOptions = {}) =>
            generate(task, options, clientOptions),
        generateStream: (task: string, options: GenerationOptions = {}) =>
            generateStream(task, options, clientOptions),
    };
}
