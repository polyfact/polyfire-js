import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Chat } from "../lib/index";

async function main() {
    const chat = new Chat({ provider: "cohere" });

    const rl = readline.createInterface({ input, output });

    while (true) {
        const userInput = await rl.question("> ");

        console.log(await chat.sendMessage(userInput));
    }
}

main();
