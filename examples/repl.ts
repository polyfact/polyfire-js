import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Chat } from "../lib/index";
const clientOptions = {
    endpoint: "https://api2.polyfact.com",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoX2lkIjoiOGJlOWQwZWYtZGMyZi00ODQzLWE0MjctYmYwNDRlZmJkNTVlIiwidXNlcl9pZCI6IjhiZTlkMGVmLWRjMmYtNDg0My1hNDI3LWJmMDQ0ZWZiZDU1ZSJ9._PlQn_SZrE7AsKqxloyunXPlrWnORMBN5mC0ZRCuxVg",
};
async function main() {
    const chat = new Chat(
        {
            autoMemory: true,
            provider: "openai",
            model: "gpt-3.5-turbo-16k",
            // systemPromptId: "8fc39ca4-3941-40d9-824a-5ed283102f6e", // Holy Bible Prompt
        },
        clientOptions,
    );

    const rl = readline.createInterface({ input, output });

    while (true) {
        const userInput = await rl.question("> ");

        const stream = chat.sendMessageStream(userInput);

        setTimeout(() => stream.stop(), 7000);

        stream.pipe(output);
        await new Promise((res) => stream.on("end", res));
        output.write("\n");
    }
}

main();
