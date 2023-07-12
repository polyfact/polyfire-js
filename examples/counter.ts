import { generateWithType } from "../index";
import * as t from "io-ts";

(async () => {
    console.log(
        await generateWithType(
            "Count from 1 to 5",
            t.type({ aa: t.array(t.type({ a: t.number })) }),
        ),
    );
})();
