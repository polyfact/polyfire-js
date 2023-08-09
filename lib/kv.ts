import axios, { AxiosError } from "axios";
import { ClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

export async function set(
    key: string,
    value: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<void> {
    try {
        const { token, endpoint } = defaultOptions(clientOptions);

        await axios.put(
            `${endpoint}/kv`,
            {
                key,
                value,
            },
            {
                headers: {
                    "X-Access-Token": token,
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export async function get(
    key: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<string> {
    try {
        const { token, endpoint } = defaultOptions(clientOptions);

        const response = await axios
            .get(`${endpoint}/kv?key=${key}`, {
                method: "GET",
                headers: {
                    "X-Access-Token": token,
                    "Content-Type": "application/json",
                },
            })
            .catch(() => ({
                data: "",
            }));

        return response.data;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        get: (key: string) => get(key, clientOptions),
        set: (key: string, value: string) => set(key, value, clientOptions),
    };
}
