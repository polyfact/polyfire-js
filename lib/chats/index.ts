import fetch from "isomorphic-fetch";
import * as t from "polyfact-io-ts";
import { ensurePolyfactToken } from "../helpers/ensurePolyfactToken";
import { generateWithTokenUsage } from "../generate";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com", POLYFACT_TOKEN = "" } = process.env;

async function createChat(systemPrompt?: string): Promise<string> {
    ensurePolyfactToken();

    const response = await fetch(`${POLYFACT_ENDPOINT}/chats`, {
        method: "POST",
        headers: {
            "X-Access-Token": POLYFACT_TOKEN,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            system_prompt: systemPrompt,
        }),
    }).then((res: any) => res.json());

    return response.id;
}

const Message = t.type({
    id: t.string,
    chat_id: t.string,
    is_user_message: t.boolean,
    content: t.string,
    created_at: t.string,
});

export class Chat {
    chatId: Promise<string>;

    provider: "openai" | "cohere";

    constructor(options: { provider?: "openai" | "cohere"; systemPrompt?: string } = {}) {
        this.chatId = createChat(options.systemPrompt);
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
        const response = await fetch(`${POLYFACT_ENDPOINT}/chat/${await this.chatId}/history`, {
            method: "GET",
            headers: {
                "X-Access-Token": POLYFACT_TOKEN,
            },
        }).then((res: any) => res.json());

        return response.filter((message: any): message is t.TypeOf<typeof Message> =>
            Message.is(message),
        );
    }
}
