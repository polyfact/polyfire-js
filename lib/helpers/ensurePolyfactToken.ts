const { POLYFACT_TOKEN = "" } = process.env;

export function ensurePolyfactToken(): void {
    if (!POLYFACT_TOKEN) {
        throw new Error(
            "Please put your polyfact token in the POLYFACT_TOKEN environment variable. You can get one at https://app.polyfact.com",
        );
    }
}
