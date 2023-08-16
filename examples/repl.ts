import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Chat } from "../lib/index";
async function main() {
    const chat = new Chat({
        autoMemory: true,
        provider: "openai",
        model: "gpt-3.5-turbo-16k",
        systemPromptId: "8fc39ca4-3941-40d9-824a-5ed283102f6e", // Holy Bible Prompt
    });

    const rl = readline.createInterface({ input, output });

    while (true) {
        const userInput = await rl.question("> ");

        const stream = chat.sendMessageStream(userInput);

        stream.pipe(output);
        await new Promise((res) => stream.on("end", res));
        output.write("\n");
    }
}

main();
