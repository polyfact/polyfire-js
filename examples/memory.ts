import { Memory } from "../lib/index";

(async () => {
    const memory = new Memory({ public: true }); // Create a public memory (default) - false for private
    console.log("Created memory:", await memory.getId());
})();
