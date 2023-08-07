import axios from "axios";
import { InputClientOptions, ClientOptions, defaultOptions } from "./clientOpts";

export async function set(
    key: string,
    value: string,
    clientOptions: InputClientOptions = {},
): Promise<void> {
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
}

export async function get(key: string, clientOptions: InputClientOptions = {}): Promise<string> {
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
}

export default function client(clientOptions: InputClientOptions = {}) {
    return {
        get: (key: string) => get(key, clientOptions),
        set: (key: string, value: string) => set(key, value, clientOptions),
    };
}
