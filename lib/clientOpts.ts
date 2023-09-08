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
        endpoint: POLYFACT_ENDPOINT || "https://api.polyfact.com",
        token: POLYFACT_TOKEN || "",

        ...opts,
    };
}

export const supabaseDefaultClient = {
    supabaseUrl: "https://hqyxaayiizqwlknddokk.supabase.co",
    supabaseKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeXhhYXlpaXpxd2xrbmRkb2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4NjIyODksImV4cCI6MjAwNTQzODI4OX0.Ae1eJU6C3e1FO5X7ES1eStnbTM87IljnuuujZ83wwzM",
};
