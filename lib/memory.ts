import fetch from "isomorphic-fetch";
import { ensurePolyfactToken } from "./helpers/ensurePolyfactToken";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com", POLYFACT_TOKEN = "" } = process.env;

class MemoryError extends Error {
    errorType?: string;

    constructor(errorType?: string) {
        // TODO: proper error handling once the api is up and running

        switch (errorType) {
            default:
                super("An unknown error occured");
                break;
        }
        this.errorType = errorType || "unknown_error";
    }
}

async function createMemory(): Promise<{ id: string }> {
    ensurePolyfactToken();

    try {
        const res = await fetch(`${POLYFACT_ENDPOINT}/memory`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": POLYFACT_TOKEN,
            },
        }).then((res: any) => res.json());

        return res;
    } catch (e) {
        if (e instanceof Error) {
            throw new MemoryError(e.name);
        }
        throw e;
    }
}

async function updateMemory(id: string, input: string): Promise<{ success: boolean }> {
    ensurePolyfactToken();

    try {
        const res = await fetch(`${POLYFACT_ENDPOINT}/memory`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": POLYFACT_TOKEN,
            },
            body: JSON.stringify({
                id,
                input,
            }),
        }).then((res: any) => res.json());

        return res;
    } catch (e) {
        if (e instanceof Error) {
            throw new MemoryError(e.name);
        }
        throw e;
    }
}

async function getAllMemories(): Promise<{ ids: string[] }> {
    ensurePolyfactToken();

    try {
        const res = await fetch(`${POLYFACT_ENDPOINT}/memories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": POLYFACT_TOKEN,
            },
        }).then((res: any) => res.json());

        return res;
    } catch (e) {
        if (e instanceof Error) {
            throw new MemoryError(e.name);
        }
        throw e;
    }
}

export { createMemory, updateMemory, getAllMemories };
