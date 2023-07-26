import { generate } from "../lib/index";

(async () => {
    console.log(
        await generate("Who is the first man on the moon?", {
            provider: "cohere",
        }),
    );
})();
