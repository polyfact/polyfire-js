import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";

import {
    generate,
    GenerationOptions,
    Generation,
    GenerationWithoutWebOptions,
    GenerationCompleteOptions,
} from "../generate";
import { InputClientOptions, ClientOptions, defaultOptions } from "../clientOpts";
import { Embeddings } from "../embeddings";
import { ApiError, PolyfireError, ErrorData } from "../helpers/error";
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
    systemPromptId?: string,
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
            console.log(e);
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export type ChatOptions = {
    autoMemory?: boolean;
    autoEmbeddings?: boolean;
    chatId?: string;
} & GenerationWithoutWebOptions;

type ProgressCallback = (step: string) => void;

export class Chat {
    chatId: Promise<string>;

    clientOptions: Promise<ClientOptions>;

    autoMemory?: Promise<Embeddings>;

    memoryId?: string;

    options: ChatOptions;

    constructor(options: ChatOptions | string = {}, clientOptions: InputClientOptions = {}) {
        this.clientOptions = defaultOptions(clientOptions);

        if (typeof options === "string") {
            this.options = { chatId: options };
        } else {
            this.options = options;
        }

        const { chatId, systemPrompt, systemPromptId, provider, autoMemory, autoEmbeddings } =
            this.options;

        this.chatId = chatId
            ? Promise.resolve(chatId)
            : createChat(systemPrompt, systemPromptId, this.clientOptions);
        this.options.provider = provider || "";

        if (autoMemory || autoEmbeddings) {
            this.autoMemory = this.clientOptions.then(
                (co) => new Embeddings({ public: false }, co),
            );
        }
    }

    static async list(clientOptions: InputClientOptions = {}): Promise<Chat[]> {
        const co = defaultOptions(clientOptions);

        const response = await axios.get(`${(await co).endpoint}/chats`, {
            headers: {
                "X-Access-Token": (await co).token,
            },
        });

        const { data }: { data: { id: string }[] } = response;

        return data.map((e) => e.id).map((id) => new Chat(id, clientOptions));
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

    sendMessage(message: string, options: GenerationOptions = {}): Generation {
        let stopped = false;
        const resultStream = new Generation({
            stop: () => {
                stopped = true;
                resultStream.push(null);
            },
            clientOptions: this.clientOptions,
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

            const result = generate(
                message,
                {
                    ...this.options,
                    ...options,
                    web: false,
                    chatId,
                } as GenerationOptions,
                await this.clientOptions,
            ).pipeInto(resultStream);

            result.on("data", (d: string) => {
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

    async getMessages({
        orderBy = "desc",
        limit = 20,
        offset = 0,
    }: {
        orderBy?: "desc" | "asc";
        limit?: number;
        offset?: number;
    } = {}): Promise<t.TypeOf<typeof Message>[]> {
        const url = new URL(
            `${(await this.clientOptions).endpoint}/chat/${await this.chatId}/history`,
        );

        if (limit < 0 || limit % 1 !== 0 || offset < 0 || offset % 1 !== 0) {
            throw new PolyfireError("limit and offset must be positive integers");
        }

        url.searchParams.append("orderBy", orderBy);
        url.searchParams.append("limit", `${limit}`);
        url.searchParams.append("offset", `${offset}`);

        try {
            const response = await axios.get(url.toString(), {
                headers: {
                    "X-Access-Token": (await this.clientOptions).token,
                },
            });

            return response?.data?.filter((message: unknown): message is t.TypeOf<typeof Message> =>
                Message.is(message),
            );
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                console.log(e);
                throw new ApiError(e?.response?.data as ErrorData);
            }
            throw e;
        }
    }
}

export type ChatClient = {
    createChat: (systemPrompt?: string, systemPromptId?: string) => Promise<string>;
    Chat: typeof Chat;
};

export default function client(clientOptions: InputClientOptions = {}): ChatClient {
    return {
        createChat: (systemPrompt?: string, systemPromptId?: string) =>
            createChat(systemPrompt, systemPromptId, clientOptions),
        Chat: class C extends Chat {
            constructor(options: ChatOptions = {}) {
                super(options, clientOptions);
            }

            static list() {
                return super.list(clientOptions);
            }
        },
    };
}
