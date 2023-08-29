import { generate, generateWithTokenUsage, getAllPrompts } from "../lib/index";

const systemPrompt = `Add all numbers together which are given in an array. your response have to be like : "4" or "2"`;

(async () => {
    const res = await generate("[7, 8, 9]", {
        systemPrompt,
        infos: false,
        web: true,
    });
    console.log(res);
})();
