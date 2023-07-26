import { createMemory, updateMemory, getAllMemories } from "../lib/index";

(async () => {
    const memory = await createMemory();
    console.log("Created memory:", memory);

    const result = await updateMemory(memory.id, "<input-data>");
    console.log("Updated memory:", result);

    const memories = await getAllMemories();
    console.log("All memories:", memories);
})();
