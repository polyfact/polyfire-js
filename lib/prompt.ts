import axios, { AxiosError } from "axios";
import { ClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

export type FilterOperation = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" | "ilike" | "cs";
export type AllowedColumns = "name" | "description" | "tags";

export type Filter = {
    column: AllowedColumns;
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
};

export type PromptInsert = Pick<Prompt, "name" | "description" | "prompt" | "tags">;
export type PromptUpdate = Partial<PromptInsert>;

async function axiosWrapper<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    data?: Record<string, string | string[]>,
    clientOptions: Partial<ClientOptions> = {},
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
        if (e instanceof AxiosError && e?.response?.data?.code) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export async function getPromptByName(
    name: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<Prompt> {
    return axiosWrapper("get", `/prompt/name/${name}`, {}, clientOptions);
}

export async function getPromptById(
    id: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<Prompt> {
    return axiosWrapper("get", `/prompt/id/${id}`, {}, clientOptions);
}

export async function getAllPrompts(
    filters?: Filter[],
    clientOptions: Partial<ClientOptions> = {},
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
        {},
        clientOptions,
    );
}

export async function createPrompt(
    promptData: PromptInsert,
    clientOptions: Partial<ClientOptions> = {},
): Promise<Prompt> {
    return axiosWrapper("post", `/prompt`, promptData, clientOptions);
}

export async function updatePrompt(
    id: string,
    promptUpdateData: PromptUpdate,
    clientOptions: Partial<ClientOptions> = {},
): Promise<Prompt> {
    return axiosWrapper("put", `/prompt/${id}`, promptUpdateData, clientOptions);
}

export async function deletePrompt(
    id: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<void> {
    return axiosWrapper("delete", `/prompt/${id}`, {}, clientOptions);
}

export default function client(clientOptions: Partial<ClientOptions> = {}) {
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
