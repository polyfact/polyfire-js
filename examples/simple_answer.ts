import { generate } from "../lib/index";

async function main() {
    const answer = await generate("Who was Neil Armstrong ?")
        .generate("Who was the US president at the time ?")
        .generate("Who was his wife ?");

    console.log(answer);
}

main();
