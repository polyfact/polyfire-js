import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

const UsageResultType = t.intersection([
    t.type({
        usage: t.number,
    }),
    t.partial({
        rate_limit: t.union([t.undefined, t.null, t.number]),
    }),
]);

export async function usage(
    clientOptions: InputClientOptions = {},
): Promise<{ usage: number; rateLimit?: number }> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.get(`${endpoint}/usage`, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        });

        if (!UsageResultType.is(res.data)) {
            throw new ApiError({
                code: "mismatched_response",
                message: "The response from the API does not match the expected format",
            });
        }

        return {
            usage: res.data.usage,
            rateLimit: res.data.rate_limit ?? undefined,
        };
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

async function getAuthID(clientOptions: InputClientOptions = {}) {
    const { token, endpoint } = await defaultOptions(clientOptions);

    try {
        const res = await axios.get(`${endpoint}/auth/id`, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        });

        if (typeof res.data !== "string") {
            throw new ApiError({
                code: "mismatched_response",
                message: "The response from the API does not match the expected format",
            });
        }

        return res.data;
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

async function getToken(clientOptions: InputClientOptions = {}) {
    const { token } = await defaultOptions(clientOptions);
    return token;
}

export type UserClient = {
    usage: () => Promise<{ usage: number; rateLimit?: number }>;
    getAuthID: () => Promise<string>;
    getToken: () => Promise<string>;
};

export default function client(clientOptions: InputClientOptions = {}): UserClient {
    return {
        usage: () => usage(clientOptions),
        getAuthID: () => getAuthID(clientOptions),
        getToken: () => getToken(clientOptions),
    };
}
