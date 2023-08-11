import axios, { AxiosError } from "axios";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

export async function set(
    key: string,
    value: string,
    clientOptions: InputClientOptions = {},
): Promise<void> {
    try {
        const { token, endpoint } = await defaultOptions(clientOptions);

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

export async function get(key: string, clientOptions: InputClientOptions = {}): Promise<string> {
    try {
        const { token, endpoint } = await defaultOptions(clientOptions);

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

export type KVClient = {
    get: (key: string) => Promise<string>;
    set: (key: string, value: string) => Promise<void>;
};

export default function client(clientOptions: InputClientOptions = {}): KVClient {
    return {
        get: (key: string) => get(key, clientOptions),
        set: (key: string, value: string) => set(key, value, clientOptions),
    };
}
