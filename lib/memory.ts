import axios, { AxiosError } from "axios";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

async function createMemory(
    clientOptions: InputClientOptions = {},
    isPublic = true,
): Promise<{ id: string }> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.post(
            `${endpoint}/memory`,
            {
                public: isPublic,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": token,
                },
            },
        );

        return res.data;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
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
    } catch (e: unknown) {
        console.log(e);
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
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
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

type MemoryAddOptions = {
    maxToken?: number;
};

class Memory {
    memoryId: Promise<string>;

    clientOptions: InputClientOptions;

    constructor(clientOptions: InputClientOptions = {}, isPublic = true) {
        this.clientOptions = defaultOptions(clientOptions);
        this.memoryId = this.clientOptions
            .then((co) => createMemory(co, isPublic))
            .then((res) => res.id);
    }

    async add(input: string, { maxToken = 0 }: MemoryAddOptions = {}): Promise<void> {
        const id = await this.memoryId;
        await updateMemory(id, input, maxToken, await this.clientOptions);
    }
}

export { createMemory, updateMemory, getAllMemories, Memory };

export type MemoryClient = {
    createMemory: (isPublic: true) => Promise<{ id: string }>;
    updateMemory: (id: string, input: string, maxToken?: number) => Promise<{ success: boolean }>;
    getAllMemories: () => Promise<{ ids: string[] }>;
    Memory: () => Memory;
};

export default function client(clientOptions: InputClientOptions = {}): MemoryClient {
    return {
        createMemory: () => createMemory(clientOptions),
        updateMemory: (id: string, input: string, maxToken?: number) =>
            updateMemory(id, input, maxToken, clientOptions),
        getAllMemories: () => getAllMemories(clientOptions),
        Memory: () => new Memory(clientOptions),
    };
}
