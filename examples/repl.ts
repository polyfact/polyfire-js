import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { AudioLoader, Chat } from "../lib/index";
import fs from "fs";

const clientOptions = {
    endpoint: "http://localhost:8080",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoX2lkIjoiOGJlOWQwZWYtZGMyZi00ODQzLWE0MjctYmYwNDRlZmJkNTVlIiwidXNlcl9pZCI6IjhiZTlkMGVmLWRjMmYtNDg0My1hNDI3LWJmMDQ0ZWZiZDU1ZSJ9.3XiX_5hNmLCRgh90EYMUudIdPXo1Nm6qbYs_8IMz8Bk",
};
async function main() {
    fs.readFile(`${__dirname}/dataloader/AudioLoader.mp3`, async function (err, data) {
        if (err) throw err;
        const chat = new Chat(
            {
                autoMemory: true,
                provider: "openai",
                model: "gpt-3.5-turbo-16k",
                // systemPromptId: "8fc39ca4-3941-40d9-824a-5ed283102f6e", // Holy Bible Prompt
            },
            clientOptions,
        );

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
