import { generateWithType, t } from "../lib/index";

const functionDescriptionType = t.type({
    functionName: t.string,
    description: t.string.description("A 50 word description of what the function does"),
    args: t.array(t.string).description("The names of the arguments"),
    returnType: t.string,
});

(async () => {
    const { returnType } = await generateWithType(
        "function add(a, b, c) { return a + b + c }",
        functionDescriptionType,
    );
    console.log(returnType);
})();
