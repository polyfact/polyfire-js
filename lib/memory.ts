import axios from "axios";
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
        const res = await axios.post(
            `${POLYFACT_ENDPOINT}/memory`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": POLYFACT_TOKEN,
                },
            },
        );

        return res.data;
    } catch (e) {
        if (e instanceof Error) {
            console.log("\n\n\n", e, "\n\n\n");
            throw new MemoryError(e.name);
        }
        throw e;
    }
}

async function updateMemory(
    id: string,
    input: string,
    maxToken = 0,
): Promise<{ success: boolean }> {
    ensurePolyfactToken();

    try {
        const res = await axios.put(
            `${POLYFACT_ENDPOINT}/memory`,
            {
                id,
                input,
                max_token: maxToken,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": POLYFACT_TOKEN,
                },
            },
        );

        return res.data;
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
        const res = await axios.get(`${POLYFACT_ENDPOINT}/memories`, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": POLYFACT_TOKEN,
            },
        });

        return res.data;
    } catch (e) {
        if (e instanceof Error) {
            throw new MemoryError(e.name);
        }
        throw e;
    }
}

type MemoryAddOptions = {
    maxToken?: number;
};

class Memory {
    memoryId: Promise<string>;

    constructor() {
        this.memoryId = createMemory().then((res) => res.id);
    }

    async add(input: string, { maxToken = 0 }: MemoryAddOptions = {}): Promise<void> {
        const id = await this.memoryId;
        await updateMemory(id, input, maxToken);
    }
}

export { createMemory, updateMemory, getAllMemories, Memory };
