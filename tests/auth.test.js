const { default: authClient } = require("../dist/auth");
const { default: userClient } = require("../dist/user");
const { MutablePromise } = require("../dist/utils");

const { ANONYMOUS_PROJECT_ID, CUSTOM_PROJECT_ID, CUSTOM_PROJECT_TOKEN, ENDPOINT } = process.env;

test("Test simple anonymous auth", () => {
    const clientOptionsPromise = new MutablePromise();

    const { init, login, logout } = authClient(clientOptionsPromise, {
        project: ANONYMOUS_PROJECT_ID,
        endpoint: ENDPOINT,
    });

    return init().then((isLoggedIn) => {
        expect(isLoggedIn).toBe(true);
    });
});

test("Test anonymous auth when disabled", () => {
    const clientOptionsPromise = new MutablePromise();

    const { init, login, logout } = authClient(clientOptionsPromise, {
        project: CUSTOM_PROJECT_ID,
        endpoint: ENDPOINT,
    });

    return init().then((isLoggedIn) => {
        expect(isLoggedIn).toBe(false);
    });
});

test("Test custom auth", () => {
    const clientOptionsPromise = new MutablePromise();

    const { init, login, logout } = authClient(clientOptionsPromise, {
        project: CUSTOM_PROJECT_ID,
        endpoint: ENDPOINT,
    });

    const { getAuthID } = userClient(clientOptionsPromise);

    return init()
        .then((isLoggedIn) => {
            expect(isLoggedIn).toBe(false);
            return login({ provider: "custom", token: CUSTOM_PROJECT_TOKEN });
        })
        .then(() => getAuthID());
});
