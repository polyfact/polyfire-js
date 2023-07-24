import { generateWithType, t } from "../lib/index";

(async () => {
    console.log(
        await generateWithType(
            "Describe this function: ```function add(a, b, c) { return a + b + c }```",
            t.type({
                result: t.intersection([
                    t.type({
                        function_name: t.string,
                        arg1_name: t.string,
                        arg2_name: t.string,
                        an_unhelpful_field_name: t.string.description(
                            "A description of the given function",
                        ),
                        type: t.union([t.literal("function"), t.literal("method")]),
                    }),
                    t.partial({
                        arg3_name: t.string,
                    }),
                ]),
            }),
        ),
    );
})();
