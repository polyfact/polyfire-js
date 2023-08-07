import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { POLYFACT_ENDPOINT, POLYFACT_TOKEN } from "./utils";

export type ClientOptions = {
    endpoint: string;
    token: string;
};

export type InputClientOptions = Partial<ClientOptions> | Promise<Partial<ClientOptions>>;

export async function defaultOptions(popts: InputClientOptions): Promise<ClientOptions> {
    const opts = await popts;
    if (!opts.token && !POLYFACT_TOKEN) {
        throw new Error(
            "Please put your polyfact token in the POLYFACT_TOKEN environment variable. You can get one at https://app.polyfact.com",
        );
    }

    return {
        endpoint: POLYFACT_ENDPOINT || "https://api2.polyfact.com",
        token: POLYFACT_TOKEN || "",
        ...opts,
    };
}
