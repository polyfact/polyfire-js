import { Readable } from "readable-stream";
import { generateStream, generateWithTokenUsage } from "../lib/generate";

const config = {
    endpoint: "http://localhost:8080",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOGJlOWQwZWYtZGMyZi00ODQzLWE0MjctYmYwNDRlZmJkNTVlIiwiaWF0IjoxNTE2MjM5MDIyfQ.1lULQuZIkRBL9eWPYjsU-x0Am4F0VauW82ZRTiRVyaE",
};

function handleStreamData(stream: Readable): Promise<void> {
    return new Promise((resolve) => {
        let buffer = "";

        stream.on("data", (data) => {
            buffer += data.toString();

            let lastSpaceIndex = buffer.lastIndexOf(" ");
            if (lastSpaceIndex !== -1) {
                let partToPrint = buffer.substring(0, lastSpaceIndex);
                buffer = buffer.substring(lastSpaceIndex + 1);
                process.stdout.write(partToPrint + " ");
            }
        });

        stream.on("end", () => {
            if (buffer.length) {
                process.stdout.write(buffer + "\n");
            }
            resolve();
        });
    });
}

(async () => {
    const response = await generateWithTokenUsage(
        "When is the next Olympics Games ?",
        { web: true, model: "gpt-4", provider: "openai" },
        config,
    );
    console.log(response);

    console.log("\n", "-".repeat(80), "\n");

    const weatherStream = generateStream(
        "what is the weather like today in Paris?",
        { web: true },
        config,
    );
    await handleStreamData(weatherStream);

    console.log("\n", "-".repeat(80), "\n");

    const websiteSummaryStream = generateStream(
        "summarize this website : read:https://www.polyfact.com/",
        { web: true },
        config,
    );
    await handleStreamData(websiteSummaryStream);
})();
