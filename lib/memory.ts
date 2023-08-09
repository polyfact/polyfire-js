import axios, { AxiosError } from "axios";
import { ClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

async function createMemory(clientOptions: Partial<ClientOptions> = {}): Promise<{ id: string }> {
    const { token, endpoint } = defaultOptions(clientOptions);

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
    clientOptions: Partial<ClientOptions> = {},
): Promise<{ success: boolean }> {
    const { token, endpoint } = defaultOptions(clientOptions);

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
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

async function getAllMemories(
    clientOptions: Partial<ClientOptions> = {},
): Promise<{ ids: string[] }> {
    const { token, endpoint } = defaultOptions(clientOptions);

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

    clientOptions: ClientOptions;

    constructor(clientOptions: Partial<ClientOptions> = {}) {
        this.clientOptions = defaultOptions(clientOptions);
        this.memoryId = createMemory(this.clientOptions).then((res) => res.id);
    }

    async add(input: string, { maxToken = 0 }: MemoryAddOptions = {}): Promise<void> {
        const id = await this.memoryId;
        await updateMemory(id, input, maxToken, this.clientOptions);
    }
}

export { createMemory, updateMemory, getAllMemories, Memory };

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        createMemory: () => createMemory(clientOptions),
        updateMemory: (id: string, input: string, maxToken?: number) =>
            updateMemory(id, input, maxToken, clientOptions),
        getAllMemories: () => getAllMemories(clientOptions),
        Memory: () => new Memory(clientOptions),
    };
}
