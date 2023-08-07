import axios from "axios";
import { ClientOptions, InputClientOptions, defaultOptions } from "./clientOpts";

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

async function createMemory(clientOptions: InputClientOptions = {}): Promise<{ id: string }> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.post(
            `${endpoint}/memory`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": token,
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
    clientOptions: InputClientOptions = {},
): Promise<{ success: boolean }> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.put(
            `${endpoint}/memory`,
            {
                id,
                input,
                max_token: maxToken,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": token,
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

async function getAllMemories(clientOptions: InputClientOptions = {}): Promise<{ ids: string[] }> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.get(`${endpoint}/memories`, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
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

    clientOptions: Promise<ClientOptions>;

    constructor(clientOptions: InputClientOptions = {}) {
        this.clientOptions = defaultOptions(clientOptions);
        this.memoryId = this.clientOptions.then((co) => createMemory(co)).then((res) => res.id);
    }

    async add(input: string, { maxToken = 0 }: MemoryAddOptions = {}): Promise<void> {
        const id = await this.memoryId;
        await updateMemory(id, input, maxToken, await this.clientOptions);
    }
}

export { createMemory, updateMemory, getAllMemories, Memory };

export default function client(clientOptions: InputClientOptions = {}) {
    return {
        createMemory: () => createMemory(clientOptions),
        updateMemory: (id: string, input: string, maxToken?: number) =>
            updateMemory(id, input, maxToken, clientOptions),
        getAllMemories: () => getAllMemories(clientOptions),
        Memory: () => new Memory(clientOptions),
    };
}
