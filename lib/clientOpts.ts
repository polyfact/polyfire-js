export type ClientOptions = {
    endpoint: string;
    token: string;
};

export function defaultOptions(opts: Partial<ClientOptions>): ClientOptions {
    if (!(opts.token || process?.env?.POLYFACT_TOKEN)) {
        throw new Error(
            "Please put your polyfact token in the POLYFACT_TOKEN environment variable. You can get one at https://app.polyfact.com",
        );
    }

    return {
        endpoint: "https://api2.polyfact.com",
        token: process?.env?.POLYFACT_TOKEN || "",
        ...opts,
    };
}
