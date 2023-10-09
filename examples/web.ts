import { Readable } from "readable-stream";
import { generate } from "../lib/generate";

// Client-side configuration for interfacing with the Polyfire API.
const config = {
    endpoint: "https://api.polyfire.com",
    token: "<YOUR_POLYFACT_TOKEN>", // API authentication token. Obtain yours from https://app.polyfire.com.
};

function handleStreamData(stream: Readable): Promise<void> {
    return new Promise((resolve) => {
        stream.pipe(process.stdout);

        stream.on("end", () => {
            process.stdout.write("\n");
            resolve();
        });
    });
}

(async () => {
    // Generate a response for a specific prompt leveraging OpenAI's GPT-4 model.
    // The 'web' option ensures enhanced compatibility with web environments.

    const response = await generate(
        "When is the next Olympics Games ?",
        { web: true, infos: true },
        config,
    );
    console.log(response);

    console.log("\n", "-".repeat(80), "\n");

    // Establish a real-time streaming connection to fetch weather details for New York.
    const weatherStream = generate(
        "what is the weather like today in New York?",
        { web: true, stream: true },
        config,
    );
    await handleStreamData(weatherStream);

    console.log("\n", "-".repeat(80), "\n");

    // Instantiate another streaming connection to get a concise summary of a specific website.
    // In this example we use a link directly in the query. to make it you have to insert `read:` just before this one
    const websiteSummaryStream = generate(
        "summarize this website : read:http://www.paulgraham.com/greatwork.html",
        { web: true, language: "french", stream: true },
        config,
    );
    await handleStreamData(websiteSummaryStream);
})();
