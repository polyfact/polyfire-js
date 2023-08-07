import axios from "axios";
import * as t from "polyfact-io-ts";
import { Readable, PassThrough } from "readable-stream";
import { generateStream, generateWithTokenUsage, GenerationOptions } from "../generate";
import { InputClientOptions, ClientOptions, defaultOptions } from "../clientOpts";
import { Memory } from "../memory";

const Message = t.type({
    id: t.string,
    chat_id: t.string,
    is_user_message: t.boolean,
    content: t.string,
    created_at: t.string,
});
export async function createChat(
    systemPrompt?: string,
    options: InputClientOptions = {},
): Promise<string> {
    const { token, endpoint } = await defaultOptions(options);

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
}

type ChatOptions = {
    provider?: "openai" | "cohere" | "llama";
    systemPrompt?: string;
    autoMemory?: boolean;
};

export class Chat {
    chatId: Promise<string>;

    provider: "openai" | "cohere" | "llama";

    clientOptions: Promise<ClientOptions>;

    autoMemory?: Promise<Memory>;

    constructor(options: ChatOptions = {}, clientOptions: InputClientOptions = {}) {
        this.clientOptions = defaultOptions(clientOptions);
        this.chatId = createChat(options.systemPrompt, this.clientOptions);
        this.provider = options.provider || "openai";
        if (options.autoMemory) {
            this.autoMemory = this.clientOptions.then((co) => new Memory(co));
        }
    }

    async sendMessageWithTokenUsage(
        message: string,
        options: GenerationOptions = {},
    ): Promise<{ result: string; tokenUsage: { input: number; output: number } }> {
        const chatId = await this.chatId;

        if (this.autoMemory && !options.memory && !options.memoryId) {
            options.memory = await this.autoMemory;
        }

        const result = await generateWithTokenUsage(
            message,
            { provider: this.provider, ...options, chatId },
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

    sendMessageStream(message: string, options: GenerationOptions = {}): Readable {
        const resultStream = new PassThrough();

        (async () => {
            const chatId = await this.chatId;

            if (this.autoMemory && !options.memory && !options.memoryId) {
                options.memory = await this.autoMemory;
            }

            const result = generateStream(
                message,
                { provider: this.provider, ...options, chatId },
                this.clientOptions,
            );

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
                (await this.autoMemory).add(`Human: ${message}`);
                (await this.autoMemory).add(`AI: ${totalResult}`);
            }
        })();

        return resultStream as unknown as Readable;
    }

    async getMessages(): Promise<t.TypeOf<typeof Message>[]> {
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
    }
}

export default function client(clientOptions: InputClientOptions = {}) {
    return {
        createChat: (systemPrompt?: string) => createChat(systemPrompt, clientOptions),
        Chat: class C extends Chat {
            constructor(options: ChatOptions = {}) {
                super(options, clientOptions);
            }
        },
    };
}
