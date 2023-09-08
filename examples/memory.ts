import { createMemory, updateMemory, getAllMemories, generate } from "../lib/index";

const clientOptions = {
    endpoint: "https://api.polyfact.com",
    token: "<YOUR_POLYFACT_TOKEN>",
};

(async () => {
    const memory = await createMemory(clientOptions, true); // Create a public memory (default) - false for private
    console.log("Created memory:", memory);

    const result = await updateMemory(memory.id, "Put here what you want to memorize", 0);
    console.log("Updated memory:", result);

    const memories = await getAllMemories();
    console.log("All memories:", memories);

    const result2 = await generate("Ask a question here about what you've memorized before", {
        memoryId: memory.id,
        infos: true,
        language: "french", // select the language of the response
    });
    console.log("Generated:", result2);
})();
