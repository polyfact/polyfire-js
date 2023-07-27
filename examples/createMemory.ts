import { Memory, generate } from "../lib/index";

(async () => {
    const memory = new Memory();

    memory.add("The secret word is: banana42");

    const result = await generate("What is the secret word?", { memory });

    console.log(result);
})();
