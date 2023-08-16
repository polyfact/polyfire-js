import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Polyfact from "../lib/index";

async function main() {
    const { Chat } = Polyfact.exec();
    const chat = new Chat({ autoMemory: true, provider: "openai", model: "gpt-3.5-turbo" });

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
