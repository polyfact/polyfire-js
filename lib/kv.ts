import axios from "axios";
import { ClientOptions, defaultOptions } from "./clientOpts";

export async function set(
    key: string,
    value: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<void> {
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
}

export async function get(
    key: string,
    clientOptions: Partial<ClientOptions> = {},
): Promise<string> {
    const { token, endpoint } = defaultOptions(clientOptions);

    const response = await axios
        .get(`${endpoint}/kv?key=${key}`, {
            method: "GET",
            headers: {
                "X-Access-Token": token,
                "Content-Type": "application/json",
            },
        })
        .then((res: any) => res.text());

    return response;
}

export default function client(clientOptions: Partial<ClientOptions> = {}) {
    return {
        get: (key: string) => get(key, clientOptions),
        set: (key: string, value: string) => set(key, value, clientOptions),
    };
}
