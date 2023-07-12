import { generateWithType } from "../lib/index";
import * as t from "io-ts";

(async () => {
    console.log(await generateWithType("Count from 1 to 5", t.type({ result: t.array(t.number) })));
})();
