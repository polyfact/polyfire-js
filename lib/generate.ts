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

const ResultType = t.type({
    result: t.string,
    tokenUsage: t.type({
        input: t.number,
        output: t.number,
    }),
    ressources: t.array(t.unknown),
});

export type GenerationOptions = {
    provider?: "openai" | "cohere";
    chatId?: string;
    memory?: Memory;
    memoryId?: string;
    stop?: string[];
    infos?: boolean;
};

export async function generateWithTokenUsage(
    task: string,
    options: GenerationOptions = {},
    clientOptions: Partial<ClientOptions> = {},
): Promise<{ result: string; tokenUsage: { input: number; output: number }; ressources: any[] }> {
    const { token, endpoint } = defaultOptions(clientOptions);
    const requestBody: {
        task: string;
        // eslint-disable-next-line camelcase
        memory_id?: string;
        // eslint-disable-next-line camelcase
        chat_id?: string;
        provider: GenerationOptions["provider"];
        stop: GenerationOptions["stop"];
        infos: GenerationOptions["infos"];
    } = {
        task,
        provider: options?.provider || "openai",
        memory_id: (await options?.memory?.memoryId) || options?.memoryId || "",
        chat_id: options?.chatId || "",
        stop: options?.stop || [],
        infos: options?.infos,
    };

    try {
        const res = await axios.post(`${endpoint}/generate`, requestBody, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        });

        const responseData = {
            result: res.data.result,
            tokenUsage: res.data.token_usage,
            ressources: res.data.ressources,
        };

        if (!ResultType.is(responseData)) {
            throw new GenerationError();
        }

        return responseData;
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
    options: GenerationOptions = {},
    clientOptions: Partial<ClientOptions> = {},
): Promise<t.TypeOf<typeof ResultType>> {
    const res = await generateWithTokenUsage(task, options, clientOptions);

    return res;
}

export function generateStreamWithInfos(
    task: string,
    options: GenerationOptions = {},
    clientOptions: Partial<ClientOptions> = {},
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
            infos: options?.infos,
        };

        const { token, endpoint } = defaultOptions(clientOptions);
        const ws = new WebSocket(`${endpoint.replace("http", "ws")}/stream`, {
            headers: {
                "X-Access-Token": token,
            },
        });

        ws.onopen = () => ws.send(JSON.stringify(requestBody));

        ws.onmessage = (data: any) => {
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
        };
    })();
    return resultStream;
}

export function generateStream(
    task: string,
    options: Omit<GenerationOptions, "infos"> = {},
    clientOptions: Partial<ClientOptions> = {},
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

        const { token, endpoint } = defaultOptions(clientOptions);
        const ws = new WebSocket(`${endpoint.replace("http", "ws")}/stream`, {
            headers: {
                "X-Access-Token": token,
            },
        });

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
