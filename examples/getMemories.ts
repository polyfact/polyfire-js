import { getAllMemories } from "../lib/index";

(async () => {
    // You need to have POLYFACT_TOKEN set in your environment variables.
    const memories = await getAllMemories();
    console.log(memories); // Outputs: { ids: ['...', '...', ...] }
})();
