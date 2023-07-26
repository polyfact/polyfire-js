import fetch from "isomorphic-fetch";
import { ensurePolyfactToken } from "../helpers/ensurePolyfactToken";
import { generateWithTokenUsage } from "../generate";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com", POLYFACT_TOKEN = "" } = process.env;

async function createChat(): Promise<string> {
    ensurePolyfactToken();

    const response = await fetch(`${POLYFACT_ENDPOINT}/chats`, {
        method: "POST",
        headers: {
            "X-Access-Token": POLYFACT_TOKEN,
        },
    }).then((res: any) => res.json());

    return response.id;
}

export class Chat {
    chatId: Promise<string>;

    provider: "openai" | "cohere";

    constructor(optipns: { provider?: "openai" | "cohere" } = {}) {
        this.chatId = createChat();
        this.provider = optipns.provider || "openai";
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
}
