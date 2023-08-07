import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Polyfact from "../lib/index";

async function main() {
    const { Chat } = Polyfact.exec();
    const chat = new Chat({ autoMemory: true, provider: "openai" });

    const rl = readline.createInterface({ input, output });

    while (true) {
        const userInput = await rl.question("> ");

        //console.log(await chat.sendMessage(userInput));
        const stream = chat.sendMessageStream(userInput);
        stream.pipe(output);
        await new Promise((res) => stream.on("end", res));
        output.write("\n");
    }
}

main();
