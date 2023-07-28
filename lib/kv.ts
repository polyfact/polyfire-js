import fetch from "isomorphic-fetch";
import { ensurePolyfactToken } from "./helpers/ensurePolyfactToken";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com", POLYFACT_TOKEN = "" } = process.env;

export async function set(key: string, value: string): Promise<void> {
    ensurePolyfactToken();

    await fetch(`${POLYFACT_ENDPOINT}/kv`, {
        method: "PUT",
        headers: {
            "X-Access-Token": POLYFACT_TOKEN,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            key,
            value,
        }),
    });
}

export async function get(key: string): Promise<string> {
    ensurePolyfactToken();

    const response = await fetch(`${POLYFACT_ENDPOINT}/kv?key=${key}`, {
        method: "GET",
        headers: {
            "X-Access-Token": POLYFACT_TOKEN,
            "Content-Type": "application/json",
        },
    }).then((res: any) => res.text());

    return response;
}
