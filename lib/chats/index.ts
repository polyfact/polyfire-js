import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { Readable, PassThrough } from "readable-stream";
import { UUID } from "crypto";
import {
    Exclusive,
    generateStream,
    generateWithTokenUsage,
    GenerationOptions,
    GenerationResult,
} from "../generate";
import { InputClientOptions, ClientOptions, defaultOptions } from "../clientOpts";
import { Memory } from "../memory";
import { ApiError, ErrorData } from "../helpers/error";

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
    provider?: "openai" | "cohere" | "llama";
    model?: string;
    autoMemory?: boolean;
} & Exclusive<{ systemPrompt?: string }, { systemPromptId?: UUID }>;

export class Chat {
    chatId: Promise<string>;

    provider: "openai" | "cohere" | "llama";

    model?: string;

    clientOptions: Promise<ClientOptions>;

    autoMemory?: Promise<Memory>;

    systemPromptId?: UUID;

    constructor(options: ChatOptions = {}, clientOptions: InputClientOptions = {}) {
        this.systemPromptId = options.systemPromptId;
        this.clientOptions = defaultOptions(clientOptions);
        this.chatId = createChat(options.systemPrompt, options.systemPromptId, this.clientOptions);
        this.provider = options.provider || "openai";
        this.model = options.model;
        if (options.autoMemory) {
            this.autoMemory = this.clientOptions.then((co) => new Memory(co));
        }
    }

    async sendMessageWithTokenUsage(
        message: string,
        options: GenerationOptions = {},
    ): Promise<GenerationResult> {
        const chatId = await this.chatId;

        if (this.autoMemory && !options.memory && !options.memoryId) {
            options.memory = await this.autoMemory;
        }
        if (this.systemPromptId) {
            options.systemPromptId = this.systemPromptId;
        }

        const result = await generateWithTokenUsage(
            message,
            {
                provider: this.provider,
                model: this.model,
                ...options,
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

    sendMessageStreamWithInfos(message: string, options: GenerationOptions = {}): Readable {
        const resultStream = new Readable({
            read() {},
            objectMode: true,
        });
        const bufs: Buffer[] = [];

        (async () => {
            const chatId = await this.chatId;

            if (this.autoMemory && !options.memory && !options.memoryId) {
                options.memory = await this.autoMemory;
            }
            if (this.systemPromptId) {
                options.systemPromptId = this.systemPromptId;
            }

            const result = generateStream(
                message,
                { ...options, chatId, infos: true },
                await this.clientOptions,
            );

            result.on("infos", (data) => {
                resultStream.emit("infos", data);
            });

            result.on("data", (d) => {
                bufs.push(d);
                resultStream.push(d);
            });
            result.on("end", () => {
                resultStream.push(null);
                (async () => {
                    if (this.autoMemory) {
                        const totalResult = new Blob(bufs).arrayBuffer().toString();
                        (await this.autoMemory).add(`Human: ${message}`);
                        (await this.autoMemory).add(`AI: ${totalResult}`);
                    }
                })();
            });
        })();

        return resultStream;
    }

    sendMessageStream(message: string, options: GenerationOptions = {}): Readable {
        const resultStream = new PassThrough();

        (async () => {
            const chatId = await this.chatId;

            if (this.autoMemory && !options.memory && !options.memoryId) {
                options.memory = await this.autoMemory;
            }
            if (this.systemPromptId) {
                options.systemPromptId = this.systemPromptId;
            }

            const result = generateStream(
                message,
                {
                    provider: this.provider,
                    model: this.model,
                    ...options,
                    chatId,
                },
                await this.clientOptions,
            );

            result.pipe(resultStream);

            const bufs: Buffer[] = [];
            const totalResult = await new Promise((res, _rej) => {
                result.on("data", (d) => {
                    bufs.push(d);
                });
                result.on("end", () => {
                    res(new Blob(bufs).arrayBuffer().toString());
                });
            });

            if (this.autoMemory) {
                (await this.autoMemory).add(`Human: ${message}`);
                (await this.autoMemory).add(`AI: ${totalResult}`);
            }
        })();

        return resultStream as unknown as Readable;
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
