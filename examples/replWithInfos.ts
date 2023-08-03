import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Chat } from "../lib/index";

async function main() {
    const chat = new Chat({ autoMemory: true, systemPrompt: "Hello, how are you?" });

    const rl = readline.createInterface({ input, output });

    while (true) {
        const userInput = await rl.question("> ");

        const chatStream = chat.sendMessageStreamWithInfos(userInput);

        chatStream.pipe(output);

        chatStream.on("infos", (infos) => {
            console.log(infos);
        });

        await new Promise((res) => {
            chatStream.on("end", res);
        });

        output.write("\n");
    }
}

main();
