import { createMemory } from "../lib/index";

(async () => {
    const memory = await createMemory();
    console.log(memory); // Outputs: { id: '...' }
})();
