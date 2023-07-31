import axios from "axios";
import * as t from "polyfact-io-ts";
import { ensurePolyfactToken } from "../helpers/ensurePolyfactToken";
import { generateWithTokenUsage } from "../generate";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com", POLYFACT_TOKEN = "" } = process.env;

async function createChat(): Promise<string> {
    ensurePolyfactToken();

    const response = await axios.post(
        `${POLYFACT_ENDPOINT}/chats`,
        {},
        {
            headers: {
                "X-Access-Token": POLYFACT_TOKEN,
            },
        },
    );

    return response?.data?.id;
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

    constructor(options: { provider?: "openai" | "cohere" } = {}) {
        this.chatId = createChat();
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
        const response = await axios.get(`${POLYFACT_ENDPOINT}/chat/${await this.chatId}/history`, {
            headers: {
                "X-Access-Token": POLYFACT_TOKEN,
            },
        });

        return response?.data?.filter((message: any): message is t.TypeOf<typeof Message> =>
            Message.is(message),
        );
    }
}
