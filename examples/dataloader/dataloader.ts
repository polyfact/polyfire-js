import { generate } from "../../lib/index";
import { AudioLoader, PDFLoader, StringLoader, TextFileLoader } from "../../lib/dataloader";
import { generateStream, generateWithTokenUsage } from "../../lib/generate";
import weirdStory from "./StringLoader";

const clientOptions = {
    endpoint: "https://api2.polyfact.com",
    token: "<YOUR_POLYFACT_TOKEN>", // You can get one at https://app.polyfact.com/
};
(async () => {
    // Generate and ask question from an audio file
    const response = await generate(
        "The man ask a question. Find and Answer at this one.",
        {
            data: AudioLoader(`${__dirname}/AudioLoader.mp3`),
            model: "gpt-4",
        },
        clientOptions,
    );
    console.log(response);

    // Generate and ask question from an pdf file with token usage
    const res = await generateWithTokenUsage(
        "What does this pdf talk about? ",
        {
            data: PDFLoader(`${__dirname}/PdfLoader.pdf`),
            model: "gpt-3.5-turbo",
        },
        clientOptions,
    );
    console.log(res);

    // Generate and ask question from a text file with token usage
    const res2 = await generateWithTokenUsage(
        "Give me back the only rows for people who bought a Smartphone (Product column)\n",
        {
            data: TextFileLoader(`${__dirname}/TextFileLoader.csv`),
            model: "gpt-4",
        },
        clientOptions,
    );

    console.log(res2);

    // Generate and ask question from a big string with token usage
    const res3 = await generateWithTokenUsage(
        "What are strange or unreal in this story ?",
        {
            data: StringLoader(weirdStory),
            model: "gpt-4",
        },
        clientOptions,
    );

    console.log(res3);

    // Generate a stream and ask question from an audio file
    const stream = generateStream(
        "What does this audio talk about? ",
        {
            data: AudioLoader(`${__dirname}/AudioLoader.mp3`),
            model: "gpt-3.5-turbo-16k",
        },
        clientOptions,
    );
    stream.pipe(process.stdout);
})();
