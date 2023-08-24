import { generateImage } from "../lib/index";

async function main() {
    console.log(
        await generateImage("Ash playing pokemon on the gameboy --niji", {
            provider: "midjourney",
        }),
    );
}

main();
