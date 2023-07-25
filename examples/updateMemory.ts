import { updateMemory } from "../lib/index";

(async () => {
    const result = await updateMemory("<memory-id>", "<input-data>");
    console.log(result); // Outputs: { success: true }
})();
