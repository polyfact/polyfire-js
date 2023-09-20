import * as t from "polyfact-io-ts";
import fakeProcess from "process";
import { Readable } from "readable-stream";
import WebSocket from "isomorphic-ws";
import { UUID } from "crypto";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { Memory } from "./memory";
import { loaderToMemory, LoaderFunction } from "./dataloader";

declare const window: {
    process: typeof fakeProcess;
};

if (typeof window !== "undefined") {
    window.process = fakeProcess;
}

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
    provider?: "openai" | "cohere" | "llama" | "" | undefined;
    model?: string;
    stop?: string[];
    temperature?: number;
    language?: Language;
};

export type ChatOptions = [{ chatId: string }];

export type MemoryOptions = [
    { memoryId: string },
    { memory: Memory },
    { data: [LoaderFunction] | LoaderFunction },
];

export type SystemPromptOptions = [{ systemPromptId: UUID }, { systemPrompt: string }];

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

export class Generation extends Readable implements Promise<string> {
    [Symbol.toStringTag] = "Generation";

    stop: () => void;

    clientOptions: InputClientOptions;

    constructor({ stop, clientOptions }: { stop?: () => void; clientOptions: InputClientOptions }) {
        super({ read() {}, objectMode: true });
        this.stop = stop || (() => {});
        this.clientOptions = clientOptions;
    }

    pipeInto(stream: Generation): Generation {
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

    stopWrap(): void {
        this.stop();
    }

    async then<TResult1 = string, TResult2 = never>(
        onfulfilled?: (value: string) => TResult1 | PromiseLike<TResult1>,
        onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
    ): Promise<TResult1 | TResult2> {
        let data = "";
        return new Promise<string>((resolve, reject) => {
            this.on("error", reject);
            this.on("end", () => {
                resolve(data);
            });
            this.on("data", (d) => {
                data += d;
            });
        }).then(onfulfilled, onrejected);
    }

    async catch<TResult = never>(
        onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>,
    ): Promise<string | TResult> {
        return this.then(undefined, onrejected);
    }

    async finally(onfinally?: () => void): Promise<string> {
        return this.then(
            (data) => {
                onfinally?.();
                return data;
            },
            (data) => {
                onfinally?.();
                throw data;
            },
        );
    }

    async infos(): Promise<GenerationResult> {
        return new Promise<GenerationResult>((resolve, reject) => {
            this.on("error", reject);
            this.on("infos", (data) => {
                resolve(data);
            });
        });
    }

    generate(task: string, options: GenerationOptions = {}): Generation {
        const resultStream = new Generation({ clientOptions: this.clientOptions });
        (async () => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            generate(`${await this} ${task}`, options).pipeInto(resultStream);
        })();

        return resultStream;
    }
}

function stream(
    task: string,
    options: GenerationOptions = {},
    clientOptions: InputClientOptions = {},
    onMessage: (data: unknown, resultStream: Generation) => void,
): Generation {
    let stopped = false;
    const resultStream = new Generation({
        stop: () => {
            stopped = true;
            resultStream.push(null);
        },
        clientOptions,
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
            infos: true,
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

const GenerateDataType = t.type({
    data: t.string,
});

export function generate(
    task: string,
    options?: GenerationOptions,
    clientOptions?: InputClientOptions,
): Generation {
    return stream(task, options, clientOptions, (data: unknown, resultStream: Generation) => {
        if (!GenerateDataType.is(data)) {
            resultStream.emit("error", "Invalid data");
            return;
        }
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
    });
}

export type GenerationClient = {
    generate: (task: string, options?: GenerationOptions) => Generation;
};

export default function client(clientOptions: InputClientOptions = {}): GenerationClient {
    return {
        generate: (task: string, options: GenerationOptions = {}) => {
            return generate(task, options, clientOptions);
        },
    };
}
