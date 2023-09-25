import axios, { AxiosError } from "axios";
import { defaultOptions, InputClientOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

export type FilterOperation =
    | "eq"
    | "neq"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "like"
    | "ilike"
    | "cs"
    | "is"
    | "in"
    | "fts"
    | "plfts"
    | "phfts";

export type Filter = {
    column: string;
    operation: FilterOperation;
    value: string;
};

export type Prompt = {
    id: string;
    name: string;
    description: string;
    prompt: string;
    createdAt: Date;
    updatedAt?: Date;
    like?: number;
    use?: number;
    tags?: string[];
    user_id?: string; // eslint-disable-line camelcase
    public: boolean;
};

export type PromptInsert = Pick<Prompt, "name" | "description" | "prompt" | "tags" | "public">;
export type PromptUpdate = Partial<PromptInsert>;

async function axiosWrapper<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    data?: Record<string, string | string[] | boolean> | undefined,
    clientOptions: InputClientOptions = {},
): Promise<T> {
    const { token, endpoint } = await defaultOptions(clientOptions);
    const headers = {
        "Content-Type": "application/json",
        "X-Access-Token": token,
    };

    try {
        const response = await axios({ method, url: `${endpoint}${url}`, headers, data });
        return response.data;
    } catch (e: unknown) {
        console.error(e);
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export async function getPromptByName(
    name: string,
    clientOptions: InputClientOptions = {},
): Promise<Prompt> {
    return axiosWrapper("get", `/prompt/name/${name}`, undefined, clientOptions);
}

export async function getPromptById(
    id: string,
    clientOptions: InputClientOptions = {},
): Promise<Prompt> {
    return axiosWrapper("get", `/prompt/id/${id}`, undefined, clientOptions);
}

export async function getAllPrompts(
    filters?: Filter[],
    clientOptions: InputClientOptions = {},
): Promise<Prompt[]> {
    let queryString = "";

    if (filters) {
        queryString = filters
            .map((filter) => `${filter.column}_${filter.operation}=${filter.value}`)
            .join("&");
    }

    return axiosWrapper(
        "get",
        `/prompts${queryString ? `?${queryString}` : ""}`,
        undefined,
        clientOptions,
    );
}

export async function createPrompt(
    promptData: PromptInsert,
    clientOptions: InputClientOptions = {},
): Promise<Prompt> {
    return axiosWrapper("post", `/prompt`, promptData, clientOptions);
}

export async function updatePrompt(
    id: string,
    promptUpdateData: PromptUpdate,
    clientOptions: InputClientOptions = {},
): Promise<Prompt> {
    return axiosWrapper("put", `/prompt/${id}`, promptUpdateData, clientOptions);
}

export async function deletePrompt(
    id: string,
    clientOptions: InputClientOptions = {},
): Promise<void> {
    return axiosWrapper("delete", `/prompt/${id}`, undefined, clientOptions);
}

export type PromptClient = {
    getPromptByName: (name: string) => Promise<Prompt>;
    getPromptById: (id: string) => Promise<Prompt>;
    getAllPrompts: (filters?: Filter[]) => Promise<Prompt[]>;
    createPrompt: (promptData: PromptInsert) => Promise<Prompt>;
    updatePrompt: (id: string, promptUpdateData: PromptUpdate) => Promise<Prompt>;
    deletePrompt: (id: string) => Promise<void>;
};

export default function client(clientOptions: InputClientOptions = {}): PromptClient {
    return {
        getPromptByName: (name: string) => getPromptByName(name, clientOptions),
        getPromptById: (id: string) => getPromptById(id, clientOptions),
        getAllPrompts: (filters?: Filter[]) => getAllPrompts(filters, clientOptions),
        createPrompt: (promptData: PromptInsert) => createPrompt(promptData, clientOptions),
        updatePrompt: (id: string, promptUpdateData: PromptUpdate) =>
            updatePrompt(id, promptUpdateData, clientOptions),
        deletePrompt: (id: string) => deletePrompt(id, clientOptions),
    };
}
