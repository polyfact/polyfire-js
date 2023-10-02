import { kv } from "../lib";

const clientOptions = {
    token: "<Your_Token_Here>",
    endpoint: "http://localhost:8080",
};

(async () => {
    const key = "test";
    const value = "value";

    await kv.set(key, value, clientOptions);
    const result = await kv.get(key, clientOptions);

    console.log(result);
    let all = await kv.all(clientOptions);

    console.log(all);

    await kv.del(key, clientOptions);

    all = await kv.all(clientOptions);

    console.log(all);
})();
