const { default: PolyfireClientBuilder } = require("../dist/client");

const { CUSTOM_PROJECT_ID, CUSTOM_PROJECT_TOKEN, ENDPOINT } = process.env;

function withClient(callback) {
    const client = PolyfireClientBuilder({ project: CUSTOM_PROJECT_ID, endpoint: ENDPOINT });

    const {
        auth: { login },
    } = client;

    return () =>
        login({ provider: "custom", token: CUSTOM_PROJECT_TOKEN }).then(() => callback(client));
}

test(
    "Test simple generation",
    withClient(async (client) => {
        const {
            models: { generate },
        } = client;

        const message = await generate('Just answer "banana42"', { temperature: 0, cache: false });

        expect(message).toBe("banana42");
    }),
);

test(
    "Test chat generation",
    withClient(async (client) => {
        const {
            utils: { Chat },
        } = client;

        const chat = new Chat();

        const message1 = await chat.sendMessage('Just answer "banana42"', {
            temperature: 0,
            cache: false,
        });

        expect(message1).toBe("banana42");

        const message2 = await chat.sendMessage(
            "Now answer the same thing but with 43 instead of 42",
            {
                temperature: 0,
                cache: false,
            },
        );
        expect(message2).toBe("banana43");
    }),
    10000,
);

test(
    "Test generation stream",
    withClient(async (client) => {
        const {
            models: { generate },
        } = client;

        const res = await new Promise((res, rej) => {
            const stream = generate('Just answer "banana42"', { temperature: 0, cache: false });
            let result = "";

            stream.on("data", (d) => {
                result += d;
            });
            stream.on("end", () => res(result));
            stream.on("error", rej);
        });

        expect(res).toBe("banana42");
    }),
);

test(
    "Test memory generation",
    withClient(async (client) => {
        const {
            models: { generate },
            data: { Embeddings },
        } = client;

        const embeddings = Embeddings();

        await embeddings.add('The word you have to remember is "banana42"');

        const message = await generate("Just answer with the word you have to remember", {
            temperature: 0,
            cache: false,
            embeddings,
            model: "gpt-3.5-turbo",
        });

        expect(message).toBe("banana42");
    }),
    10000,
);
