import { Memory, generate } from "../lib/index";

(async () => {
    const memory = new Memory({}, true);

    // memory.add("The secret word is: banana42");

    const result = await generate("What is the secret word?", {
        memoryId: "18ebfaa2-79c2-4b22-828a-b1c2e95cb804",
    });

    console.log(result);
})();
