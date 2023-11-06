import axios, { AxiosError } from "axios";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

async function createEmbeddings(
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
            console.error(e);
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

async function updateEmbeddings(
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
        console.error(e);
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

async function getAllEmbeddings(
    clientOptions: InputClientOptions = {},
): Promise<{ ids: string[] }> {
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

async function searchEmbeddings(
    id: string,
    input: string,
    clientOptions: InputClientOptions = {},
): Promise<{ id: string; content: string; similarity: number }[]> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.post(
            `${endpoint}/memory/${id}/search`,
            {
                input,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": token,
                },
            },
        );

        return res.data.results;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

type EmbeddingsAddOptions = {
    maxToken?: number;
};

type EmbeddingsOptions =
    | {
          id: string;
      }
    | {
          public?: boolean;
      }
    | string;

class Embeddings {
    memoryId: PromiseLike<string>;

    clientOptions: InputClientOptions;

    constructor(embeddingsOptions?: EmbeddingsOptions, clientOptions: InputClientOptions = {}) {
        this.clientOptions = defaultOptions(clientOptions);
        if (embeddingsOptions !== undefined && typeof embeddingsOptions === "string") {
            this.memoryId = Promise.resolve(embeddingsOptions);
        } else if (
            embeddingsOptions &&
            typeof embeddingsOptions === "object" &&
            "id" in embeddingsOptions
        ) {
            this.memoryId = Promise.resolve(embeddingsOptions.id);
        } else {
            const isPublic = (embeddingsOptions || {}).public;
            this.memoryId = this.clientOptions
                .then((co) => createEmbeddings(co, isPublic))
                .then((res) => res.id);
        }
    }

    async add(input: string, { maxToken = 0 }: EmbeddingsAddOptions = {}): Promise<void> {
        const id = await this.memoryId;
        await updateEmbeddings(id, input, maxToken, await this.clientOptions);
    }

    async getId(): Promise<string> {
        return this.memoryId;
    }

    async search(input: string): Promise<{ id: string; content: string; similarity: number }[]> {
        const id = await this.memoryId;
        return searchEmbeddings(id, input, await this.clientOptions);
    }
}

export { createEmbeddings, updateEmbeddings, getAllEmbeddings, Embeddings };

export type EmbeddingsClient = {
    createMemory: (isPublic: true) => Promise<{ id: string }>;
    updateMemory: (id: string, input: string, maxToken?: number) => Promise<{ success: boolean }>;
    getAllMemories: () => Promise<{ ids: string[] }>;
    Memory: () => Embeddings;
    createEmbeddings: (isPublic: true) => Promise<{ id: string }>;
    updateEmbeddings: (
        id: string,
        input: string,
        maxToken?: number,
    ) => Promise<{ success: boolean }>;
    getAllEmbeddings: () => Promise<{ ids: string[] }>;
    Embeddings: () => Embeddings;
};

export default function client(clientOptions: InputClientOptions = {}): EmbeddingsClient {
    return {
        createMemory: () => createEmbeddings(clientOptions),
        updateMemory: (id: string, input: string, maxToken?: number) =>
            updateEmbeddings(id, input, maxToken, clientOptions),
        getAllMemories: () => getAllEmbeddings(clientOptions),
        Memory: (embeddingsOptions?: EmbeddingsOptions) =>
            new Embeddings(embeddingsOptions, clientOptions),
        createEmbeddings: () => createEmbeddings(clientOptions),
        updateEmbeddings: (id: string, input: string, maxToken?: number) =>
            updateEmbeddings(id, input, maxToken, clientOptions),
        getAllEmbeddings: () => getAllEmbeddings(clientOptions),
        Embeddings: (embeddingsOptions?: EmbeddingsOptions) =>
            new Embeddings(embeddingsOptions, clientOptions),
    };
}
