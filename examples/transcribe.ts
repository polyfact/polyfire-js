import { createReadStream } from "fs";
import { transcribe } from "../lib/index";

(async () => {
    const filename = process.argv[2];

    if (!filename) {
        console.log("Usage: ts-node transcribe.ts <filename>");
        process.exit(1);
    }
    console.log(await transcribe(createReadStream(filename)));
})();
