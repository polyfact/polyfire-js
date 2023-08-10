import { generate } from "../lib/index";

(async () => {
    const res = await generate(
        "i want a Swiss white beger dog",
        {
            promptId: "f4a1f732-9c38-4bdb-b9e4-3baa7971286a",
            infos: true,
        },
        {
            endpoint: "http://localhost:8080",
            token: "<token>",
        },
    );
    console.log(res);
})();
