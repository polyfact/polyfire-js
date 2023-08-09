import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { Readable, PassThrough } from "stream";
import {
    generateStream,
    generateStreamWithInfos,
    generateWithTokenUsage,
    GenerationOptions,
    GenerationResult,
} from "../generate";
import { ClientOptions, defaultOptions } from "../clientOpts";
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
    options: Partial<ClientOptions> = {},
): Promise<string> {
    try {
        const { token, endpoint } = defaultOptions(options);

        const response = await axios.post(
            `${endpoint}/chats`,
            { system_prompt: systemPrompt },
            {
                headers: {
                    "X-Access-Token": token,
                },
            },
        );

        return response?.data?.id;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export class Chat {
    chatId: Promise<string>;

    provider: "openai" | "cohere";

    clientOptions: ClientOptions;

    autoMemory?: Memory;

    constructor(
        options: {
            provider?: "openai" | "cohere";
            systemPrompt?: string;
            autoMemory?: boolean;
        } = {},
        clientOptions: Partial<ClientOptions> = {},
    ) {
        this.clientOptions = defaultOptions(clientOptions);
        this.chatId = createChat(options.systemPrompt, this.clientOptions);
        this.provider = options.provider || "openai";
        if (options.autoMemory) {
            this.autoMemory = new Memory(this.clientOptions);
        }
    }

    async sendMessageWithTokenUsage(
        message: string,
        options: GenerationOptions = {},
    ): Promise<GenerationResult> {
        const chatId = await this.chatId;

        if (this.autoMemory && !options.memory && !options.memoryId) {
            options.memory = this.autoMemory;
        }

        const result = await generateWithTokenUsage(
            message,
            { ...options, chatId },
            this.clientOptions,
        );

        if (this.autoMemory) {
            this.autoMemory.add(`Human: ${message}`);
            this.autoMemory.add(`AI: ${result.result}`);
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
                options.memory = this.autoMemory;
            }

            const result = generateStreamWithInfos(
                message,
                { ...options, chatId },
                this.clientOptions,
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
                if (this.autoMemory) {
                    const totalResult = Buffer.concat(bufs).toString("utf8");
                    this.autoMemory.add(`Human: ${message}`);
                    this.autoMemory.add(`AI: ${totalResult}`);
                }
            });
        })();

        return resultStream;
    }

    sendMessageStream(message: string, options: GenerationOptions = {}): Readable {
        const resultStream = new PassThrough();

        (async () => {
            const chatId = await this.chatId;

            if (this.autoMemory && !options.memory && !options.memoryId) {
                options.memory = this.autoMemory;
            }

            const result = generateStream(message, { ...options, chatId }, this.clientOptions);

            result.pipe(resultStream);

            const bufs: Buffer[] = [];
            const totalResult = await new Promise((res, _rej) => {
                result.on("data", (d) => {
                    bufs.push(d);
                });
                result.on("end", () => {
                    res(Buffer.concat(bufs).toString("utf8"));
                });
            });

            if (this.autoMemory) {
                this.autoMemory.add(`Human: ${message}`);
                this.autoMemory.add(`AI: ${totalResult}`);
            }
        })();

        return resultStream;
    }

    async getMessages(): Promise<t.TypeOf<typeof Message>[]> {
        try {
            const response = await axios.get(
                `${this.clientOptions.endpoint}/chat/${await this.chatId}/history`,
                {
                    headers: {
                        "X-Access-Token": this.clientOptions.token,
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

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        createChat: (systemPrompt?: string) => createChat(systemPrompt, clientOptions),
        Chat: (options?: { provider?: "openai" | "cohere"; systemPrompt?: string }) =>
            new Chat(options, clientOptions),
    };
}
