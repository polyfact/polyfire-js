import { kv, generateWithType, t } from "../lib/index";

const functionDescriptionType = t.type({
    functionName: t.string,
    description: t.string.description("A 50 word description of what the function does"),
    args: t.array(t.string).description("The names of the arguments"),
    type: t
        .keyof({
            function: null,
            method: null,
        })
        .description("Whether the function is a function or a method"),
    returnType: t.string,
});

(async () => {
    await kv.set("abc", "");
    console.log(await kv.get("abc"));
    const res = await generateWithType(
        "function add(a, b, c) { return a + b + c }",
        functionDescriptionType,
        {},
    );
    console.log(res);
})();
