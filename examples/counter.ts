import { generateWithType, splitString } from "../lib/index";
import * as t from "io-ts";

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
