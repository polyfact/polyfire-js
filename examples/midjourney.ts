import { generate } from "../lib/index";

const systemPrompt = `Add all numbers together which are given in an array. your response have to be like : "4" or "2"`;

(async () => {
    const res = await generate(
        "i want a Swiss white beger dog",
        {
            promptId: "f4a1f732-9c38-4bdb-b9e4-3baa7971286a",
            infos: true,
        },
        {
            endpoint: "http://localhost:8080",
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.5ThO9HHg9bxqpnoYUJmeimifVwzcLQ_DsGNdll4q-Rc",
        },
    );
    console.log(res);
})();
