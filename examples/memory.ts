import { createMemory, updateMemory, getAllMemories, generate } from "../lib/index";

(async () => {
    const memory = await createMemory();
    console.log("Created memory:", memory);

    const result = await updateMemory(memory.id, "<input-data> is here", 0);
    console.log("Updated memory:", result);

    const memories = await getAllMemories();
    console.log("All memories:", memories);

    const result2 = await generate("<input-data>", { memoryId: memory.id, infos: true });
    console.log("Generated:", result2);
})();
