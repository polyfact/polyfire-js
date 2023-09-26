import { readFileSync } from "fs";
import { generate, PdfLoader } from "../lib";

(async () => {
    const result = await generate("What is the secret ?", {
        data: PdfLoader(readFileSync("/home/lancelot/test.pdf")),
    }).infos();

    console.log(result);
})();
