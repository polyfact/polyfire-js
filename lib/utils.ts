let token: string | undefined;
let endpoint: string | undefined;

if (typeof process !== "undefined") {
    token = process?.env?.POLYFACT_TOKEN;
    endpoint = process?.env?.POLYFACT_ENDPOINT;
}

export const POLYFACT_TOKEN = token;
export const POLYFACT_ENDPOINT = endpoint;
