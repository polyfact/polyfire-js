import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { AudioLoader, Chat } from "../lib/index";
import fs from "fs";

async function main() {
    fs.readFile(`${__dirname}/dataloader/AudioLoader.mp3`, async function (err, data) {
        if (err) throw err;
        const chat = new Chat({
            autoMemory: true,
            provider: "openai",
            model: "gpt-3.5-turbo-16k",
            // systemPromptId: "8fc39ca4-3941-40d9-824a-5ed283102f6e", // Holy Bible Prompt
        });

        await chat.dataLoader(AudioLoader(data), (step) => console.log(step));

        const rl = readline.createInterface({ input, output });

        while (true) {
            const userInput = await rl.question("> ");

            const stream = chat.sendMessageStreamWithInfos(userInput);

            stream.on("infos", (infos) => {
                console.log(infos);
            });

            setTimeout(() => stream.stop(), 7000);

            stream.pipe(output);
            await new Promise((res) => stream.on("end", res));

            output.write("\n");
        }
    });
}

main();
