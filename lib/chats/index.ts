import axios from "axios";
import * as t from "polyfact-io-ts";
import { generateWithTokenUsage } from "../generate";
import { ClientOptions, defaultOptions } from "../clientOpts";

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
}

export class Chat {
    chatId: Promise<string>;

    provider: "openai" | "cohere";

    clientOptions: ClientOptions;

    constructor(
        options: { provider?: "openai" | "cohere"; systemPrompt?: string } = {},
        clientOptions: Partial<ClientOptions> = {},
    ) {
        this.clientOptions = defaultOptions(clientOptions);
        this.chatId = createChat(options.systemPrompt, this.clientOptions);
        this.provider = options.provider || "openai";
    }

    async sendMessageWithTokenUsage(
        message: string,
    ): Promise<{ result: string; tokenUsage: { input: number; output: number } }> {
        const chatId = await this.chatId;

        const result = await generateWithTokenUsage(message, { chatId });

        return result;
    }

    async sendMessage(message: string): Promise<string> {
        const result = await this.sendMessageWithTokenUsage(message);

        return result.result;
    }

    async getMessages(): Promise<t.TypeOf<typeof Message>[]> {
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
    }
}

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        createChat: (systemPrompt?: string) => createChat(systemPrompt, clientOptions),
        Chat: (options?: { provider?: "openai" | "cohere"; systemPrompt?: string }) =>
            new Chat(options, clientOptions),
    };
}
