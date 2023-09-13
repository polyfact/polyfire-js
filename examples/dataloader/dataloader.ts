import { generate } from "../../lib/index";
import { AudioLoader, StringLoader, TextFileLoader } from "../../lib/dataloader";
import { generate } from "../../lib/generate";
import weirdStory from "./StringLoader";
import fs from "fs";

const clientOptions = {
    endpoint: "https://api.polyfact.com",
    token: "<YOUR_POLYFACT_TOKEN>", // You can get one at https://app.polyfact.com/
};
(async () => {
    // Generate and ask question from an audio file
    fs.readFile(`${__dirname}/AudioLoader.mp3`, async (_err, data) => {
        const response = await generate(
            "The man ask a question. Find and Answer at this one.",
            {
                data: AudioLoader(data),
                model: "gpt-4",
            },
            clientOptions,
        );
        console.log(response);
    });

    // Generate and ask question from a text file with token usage

    fs.readFile(`${__dirname}/TextFileLoader.csv`, async (_err, data) => {
        const res2 = await generate(
            "Give me back the only rows for people who bought a Smartphone (Product column)\n",
            {
                data: TextFileLoader(data),
                model: "gpt-4",
                infos: true,
            },
            clientOptions,
        );

        console.log(res2);
    });

    // Generate and ask question from a big string with token usage
    const res3 = await generate(
        "What are strange or unreal in this story ?",
        {
            data: StringLoader(weirdStory),
            model: "gpt-4",
            infos: true,
        },
        clientOptions,
    );

    console.log(res3);

    // Generate a stream and ask question from an audio file
    fs.readFile(`${__dirname}/AudioLoader.mp3`, async (_err, data) => {
        const stream = generate(
            "What does this audio talk about? ",
            {
                data: AudioLoader(data),
                model: "gpt-3.5-turbo-16k",
                stream: true,
            },
            clientOptions,
        );
        stream.pipe(process.stdout);
        await new Promise((res) => stream.on("end", res));
        process.stdout.write("\n");
    });
})();
