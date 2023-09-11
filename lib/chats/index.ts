import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { UUID } from "crypto";

import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";
import {
    generateStream,
    generateWithTokenUsage,
    GenerationOptions,
    GenerationResult,
    GenerationStream,
    GenerationWithoutWebOptions,
    GenerationCompleteOptions,
} from "../generate";
import { InputClientOptions, ClientOptions, defaultOptions } from "../clientOpts";
import { Memory } from "../memory";
import { ApiError, ErrorData } from "../helpers/error";
import { LoaderFunction, loaderToMemory } from "../dataloader";

const Message = t.type({
    id: t.string,
    chat_id: t.string,
    is_user_message: t.boolean,
    content: t.string,
    created_at: t.string,
});
export async function createChat(
    systemPrompt?: string,
    systemPromptId?: UUID,
    options: InputClientOptions = {},
): Promise<string> {
    try {
        const { token, endpoint } = await defaultOptions(options);

        const body = {
            ...(systemPromptId ? { system_prompt_id: systemPromptId } : {}),
            ...(systemPrompt && !systemPromptId ? { system_prompt: systemPrompt } : {}),
        };

        const response = await axios.post(`${endpoint}/chats`, body, {
            headers: {
                "X-Access-Token": token,
            },
        });

        return response?.data?.id;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

type ChatOptions = {
    autoMemory?: boolean;
} & GenerationWithoutWebOptions;

type ProgressCallback = (step: string) => void;

export class Chat {
    chatId: Promise<string>;

    clientOptions: Promise<ClientOptions>;

    autoMemory?: Promise<Memory>;

    memoryId?: string;

    options: ChatOptions;

    constructor(options: ChatOptions = {}, clientOptions: InputClientOptions = {}) {
        this.options = options;
        this.clientOptions = defaultOptions(clientOptions);
        this.chatId = createChat(options.systemPrompt, options.systemPromptId, this.clientOptions);
        this.options.provider = options.provider || "";

        if (options.autoMemory) {
            this.autoMemory = this.clientOptions.then((co) => new Memory(co));
        }
    }

    async dataLoader(
        data: LoaderFunction | LoaderFunction[],
        onProgress: ProgressCallback,
    ): Promise<void> {
        try {
            onProgress("START_LOADING");
            const memory = await loaderToMemory(data, this.clientOptions);

            onProgress("GET_MEMORY_ID");
            this.memoryId = await memory.memoryId;

            onProgress("FULLY_LOADED");
        } catch (error) {
            onProgress("LOAD_ERROR");
            console.error("Error loading data into memory:", error);
        }
    }

    async sendMessageWithTokenUsage(
        message: string,
        options: GenerationOptions = {},
    ): Promise<GenerationResult> {
        const chatId = await this.chatId;
        const genOptions = options as GenerationCompleteOptions;

        if (this.autoMemory && !genOptions.memory && !genOptions.memoryId) {
            genOptions.memory = await this.autoMemory;
        }

        if (this.options.systemPromptId) {
            genOptions.systemPromptId = this.options.systemPromptId;
        }

        if (this.memoryId) {
            genOptions.memoryId = this.memoryId;
        }

        const result = await generateWithTokenUsage(
            message,
            {
                ...options,
                web: false,
                chatId,
            },
            this.clientOptions,
        );

        if (this.autoMemory) {
            (await this.autoMemory).add(`Human: ${message}`);
            (await this.autoMemory).add(`AI: ${result.result}`);
        }

        return result;
    }

    async sendMessage(message: string, options: GenerationOptions = {}): Promise<string> {
        const result = await this.sendMessageWithTokenUsage(message, options);

        return result.result;
    }

    sendMessageStreamWithInfos(message: string, options: GenerationOptions = {}): GenerationStream {
        let stopped = false;
        const resultStream = new GenerationStream({
            stop: () => {
                stopped = true;
                resultStream.push(null);
            },
        });
        let aiMessage = "";

        (async () => {
            const chatId = await this.chatId;
            const genOptions = options as GenerationCompleteOptions;

            if (this.autoMemory && !genOptions.memory && !genOptions.memoryId) {
                genOptions.memory = await this.autoMemory;
            }
            if (this.options.systemPromptId) {
                genOptions.systemPromptId = this.options.systemPromptId;
            }

            if (this.memoryId) {
                genOptions.memoryId = this.memoryId;
            }

            if (stopped) {
                return;
            }

            const result = generateStream(
                message,
                { ...options, web: false, chatId, infos: true },
                await this.clientOptions,
            ).pipeInto(resultStream);

            result.on("data", (d) => {
                aiMessage = aiMessage.concat(d);
            });

            result.on("end", () => {
                (async () => {
                    if (this.autoMemory) {
                        (await this.autoMemory).add(`Human: ${message}`);
                        (await this.autoMemory).add(`AI: ${aiMessage}`);
                    }
                })();
            });
        })();

        return resultStream;
    }

    sendMessageStream(message: string, options: GenerationOptions = {}): GenerationStream {
        let stopped = false;
        const resultStream = new GenerationStream({
            stop: () => {
                stopped = true;
                resultStream.push(null);
            },
        });

        (async () => {
            const chatId = await this.chatId;
            const genOptions = options as GenerationCompleteOptions;

            if (this.autoMemory && !genOptions.memory && !genOptions.memoryId) {
                genOptions.memory = await this.autoMemory;
            }
            if (this.options.systemPromptId) {
                genOptions.systemPromptId = this.options.systemPromptId;
            }
            if (this.memoryId) {
                genOptions.memoryId = this.memoryId;
            }

            if (stopped) {
                return;
            }

            const result = generateStream(
                message,
                {
                    ...options,
                    web: false,
                    chatId,
                },
                await this.clientOptions,
            );

            result.pipeInto(resultStream);

            const bufs: Buffer[] = [];
            const totalResult = await new Promise((res, _rej) => {
                result.on("end", () => {
                    res(new Blob(bufs).arrayBuffer().toString());
                });
            });

            if (this.autoMemory) {
                (await this.autoMemory).add(`Human: ${message}`);
                (await this.autoMemory).add(`AI: ${totalResult}`);
            }
        })();

        return resultStream as unknown as GenerationStream;
    }

    async getMessages(): Promise<t.TypeOf<typeof Message>[]> {
        try {
            const response = await axios.get(
                `${(await this.clientOptions).endpoint}/chat/${await this.chatId}/history`,
                {
                    headers: {
                        "X-Access-Token": (await this.clientOptions).token,
                    },
                },
            );

            return response?.data?.filter((message: any): message is t.TypeOf<typeof Message> =>
                Message.is(message),
            );
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                throw new ApiError(e?.response?.data as ErrorData);
            }
            throw e;
        }
    }
}

export type ChatClient = {
    createChat: (systemPrompt?: string, systemPromptId?: UUID) => Promise<string>;
    Chat: typeof Chat;
};

export default function client(clientOptions: InputClientOptions = {}): ChatClient {
    return {
        createChat: (systemPrompt?: string, systemPromptId?: UUID) =>
            createChat(systemPrompt, systemPromptId, clientOptions),
        Chat: class C extends Chat {
            constructor(options: ChatOptions = {}) {
                super(options, clientOptions);
            }
        },
    };
}
