import { POLYFACT_ENDPOINT, POLYFACT_TOKEN, MutablePromise } from "./utils";
import { PolyfireError } from "./helpers/error";

export type ClientOptions = {
    endpoint: string;
    token: string;
};

export type InputClientOptions = Partial<ClientOptions> | PromiseLike<Partial<ClientOptions>>;

export async function defaultOptions(popts: InputClientOptions): Promise<ClientOptions> {
    const opts = await popts;
    if (!opts.token && !POLYFACT_TOKEN) {
        throw new PolyfireError("Missing polyfire token");
    }

    return {
        endpoint: POLYFACT_ENDPOINT || "https://api.polyfire.com",
        token: POLYFACT_TOKEN || "",

        ...opts,
    };
}

export const supabaseDefaultClient = {
    supabaseUrl: "https://sb.polyfire.com",
    supabaseKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwbWxkcmttd3J0cXdubnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY4NDAwMTgsImV4cCI6MjAxMjQxNjAxOH0.oBFkqo9r31dXUVEdOJy7RnNzhZkugjxDaaTTf6RM26U",
};

export type ClientState = {
    co: MutablePromise<Partial<ClientOptions>>;
};
