import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import * as t from "polyfact-io-ts";
import { Mutex } from "async-mutex";
import { POLYFACT_TOKEN, POLYFACT_ENDPOINT } from "./utils";
import generateClient, {
    generate,
    generateWithTokenUsage,
    GenerationOptions,
    GenerationClient,
} from "./generate";
import generateWithTypeClient, {
    generateWithType,
    generateWithTypeWithTokenUsage,
    GenerationWithTypeClient,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { transcribe, TranscribeClient } from "./transcribe";
import chatClient, { Chat, ChatClient } from "./chats";
import memoryClient, {
    Memory,
    createMemory,
    updateMemory,
    getAllMemories,
    MemoryClient,
} from "./memory";
import { splitString, tokenCount } from "./split";
import { InputClientOptions } from "./clientOpts";
import kvClient, { get as KVGet, set as KVSet, KVClient } from "./kv";

// Export types and models
export type { TokenUsage, Ressource, GenerationResult } from "./generate";
export * from "./helpers/models";

// KV operations
const kv = {
    get: KVGet,
    set: KVSet,
};

// Export methods
export {
    generate,
    generateWithTokenUsage,
    generateWithType,
    generateWithTypeWithTokenUsage,
    splitString,
    tokenCount,
    t,
    GenerationOptions,
    transcribe,
    createMemory,
    updateMemory,
    getAllMemories,
    Chat,
    Memory,
    kv,
};

type Client = GenerationClient &
    GenerationWithTypeClient &
    TranscribeClient &
    MemoryClient &
    ChatClient & { kv: KVClient };

function client(co: InputClientOptions): Client {
    return {
        ...generateClient(co),
        ...generateWithTypeClient(co),
        ...transcribeClient(co),
        ...memoryClient(co),
        ...chatClient(co),
        kv: kvClient(co),
    };
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

const supabaseDefaultClient = {
    supabaseUrl: "https://hqyxaayiizqwlknddokk.supabase.co",
    supabaseKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeXhhYXlpaXpxd2xrbmRkb2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4NjIyODksImV4cCI6MjAwNTQzODI4OX0.Ae1eJU6C3e1FO5X7ES1eStnbTM87IljnuuujZ83wwzM",
};

declare const window: any;

export class PolyfactClientBuilder implements PromiseLike<ReturnType<typeof client>> {
    private buildQueue: (() => Promise<void>)[] = [];

    private clientOptions: InputClientOptions = {
        endpoint: POLYFACT_ENDPOINT || "https://api2.polyfact.com",
    };

    private authToken: Promise<string>;

    private authTokenResolve: (authToken: string) => void;

    private isAuthTokenSetSync: boolean;

    private supabaseClient: ReturnType<typeof createClient>;

    constructor(
        supabaseClient: { supabaseUrl: string; supabaseKey: string } = supabaseDefaultClient,
    ) {
        let resolve: (authToken: string) => void;
        this.authToken = new Promise<string>((res) => {
            resolve = res;
        });
        this.authTokenResolve = resolve!;
        this.isAuthTokenSetSync = false;
        this.supabaseClient = createClient(supabaseClient.supabaseUrl, supabaseClient.supabaseKey, {
            auth: { persistSession: false },
        });
    }

    async then<T1 = never, T2 = never>(
        res?: null | ((c: ReturnType<typeof client>) => T1 | Promise<T1>),
        _rej?: null | ((e: Error) => T2 | Promise<T2>),
    ): Promise<T1 | T2> {
        if (!this.isAuthTokenSetSync && POLYFACT_TOKEN) {
            this.isAuthTokenSetSync = true;
            this.authTokenResolve(POLYFACT_TOKEN);
            const co = await this.clientOptions;
            co.token = POLYFACT_TOKEN;
            this.clientOptions = co;
        }

        if (!this.isAuthTokenSetSync) {
            throw new Error(
                "You must use at least one signing method when initializing polyfact or set the POLYFACT_TOKEN environment variable.",
            );
        }

        await Promise.all(this.buildQueue.map((e) => e()));

        if (res) {
            return res(client(this.clientOptions));
        }

        throw new Error("Missing function in then");
    }

    exec(): ReturnType<typeof client> {
        const co = (async () => {
            if (!this.isAuthTokenSetSync && POLYFACT_TOKEN) {
                this.isAuthTokenSetSync = true;
                this.authTokenResolve(POLYFACT_TOKEN);
                const co = await this.clientOptions;
                co.token = POLYFACT_TOKEN;
                this.clientOptions = co;
            }

            if (!this.isAuthTokenSetSync) {
                throw new Error(
                    "You must use at least one signing method when initializing polyfact or set the POLYFACT_TOKEN environment variable.",
                );
            }

            await Promise.all(this.buildQueue.map((e) => e()));

            return this.clientOptions;
        })();

        return client(co);
    }

    endpoint(endpoint: string): PolyfactClientBuilder {
        const co = this.clientOptions;
        this.clientOptions = (async () => {
            const coSync = await co;
            coSync.endpoint = endpoint;
            return coSync;
        })();

        return this;
    }

    signInWithToken(token: string): PolyfactClientBuilder {
        this.isAuthTokenSetSync = true;
        this.authTokenResolve(token);
        return this;
    }

    signInWithPassword(credentials: { email: string; password: string }): PolyfactClientBuilder {
        this.isAuthTokenSetSync = true;
        this.buildQueue.push(async () => {
            const data = await this.supabaseClient.auth.signInWithPassword(credentials);

            if (!data?.data?.session?.access_token) {
                throw new Error("signInWithPassword failed");
            }

            this.authTokenResolve(data.data.session.access_token);
        });
        return this;
    }

    signInWithOAuth(
        credentials: Awaited<
            Parameters<ReturnType<typeof createClient>["auth"]["signInWithOAuth"]>[0]
        >,
    ): PolyfactClientBuilder {
        if (typeof window === "undefined") {
            throw new Error("signInWithOAuth not usable outside of the browser environment");
        }
        console.log({
            options: { redirectTo: window?.location },
        });
        this.isAuthTokenSetSync = true;
        this.buildQueue.push(async () => {
            await this.supabaseClient.auth.signInWithOAuth({
                ...credentials,
                options: { redirectTo: window?.location },
            });
        });
        this.buildQueue.push(() => new Promise<void>(() => {})); // Since it should redirect to another page, the promise shouldn't resolve.
        return this;
    }

    project(projectId: string): PolyfactClientBuilder {
        this.buildQueue.push(async () => {
            if (projectId) {
                const { data } = await axios.get(
                    `${(await this.clientOptions).endpoint}/project/${projectId}/auth/token`,
                    { headers: { Authorization: `Bearer ${await this.authToken}` } },
                );
                (await this.clientOptions).token = data;
            }
        });
        return this;
    }
}

const Polyfact = new PolyfactClientBuilder();

export default Polyfact;

const reactMutex = new Mutex();

type Provider = "github" | "google";

export function usePolyfact({ project, endpoint }: { project: string; endpoint?: string }): {
    polyfact: Client | undefined;
    login: ((input: { provider: Provider }) => Promise<void>) | undefined;
    loading: boolean;
} {
    if (typeof window === "undefined") {
        throw new Error("usePolyfact not usable outside of the browser environment");
    }

    const react = require("react"); // eslint-disable-line
    const [polyfact, setPolyfact] = react.useState();
    const [loading, setLoading] = react.useState(true);
    const [login, setLogin] = react.useState();

    react.useEffect(() => {
        (async () => {
            await reactMutex.acquire();
            let token = new URLSearchParams(window.location.hash.replace(/^#/, "?")).get(
                "access_token",
            );
            let refreshToken = new URLSearchParams(window.location.hash.replace(/^#/, "?")).get(
                "refresh_token",
            );

            const supabase = createClient(
                supabaseDefaultClient.supabaseUrl,
                supabaseDefaultClient.supabaseKey,
                {
                    auth: { persistSession: false },
                },
            );
            if (!refreshToken && window.localStorage.getItem("polyfact_refresh_token")) {
                refreshToken = window.localStorage.getItem("polyfact_refresh_token");
            } else if (refreshToken) {
                window.localStorage.setItem("polyfact_refresh_token", refreshToken);
            }

            if (refreshToken) {
                if (!token) {
                    const { data } = await supabase.auth.refreshSession({
                        refresh_token: refreshToken,
                    });

                    token = data.session?.access_token || "";

                    if (!token) {
                        window.localStorage.removeItem("polyfact_refresh_token");
                        window.location.reload();
                        return;
                    }

                    window.localStorage.setItem(
                        "polyfact_refresh_token",
                        data.session?.refresh_token,
                    );
                }
                const p = await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                    .project(project)
                    .signInWithToken(token);
                setLoading(false);
                setPolyfact(p);
            } else {
                setLogin(() => async ({ provider }: { provider: Provider }) => {
                    await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                        .project(project)
                        .signInWithOAuth({ provider });
                });
                setLoading(false);
            }

            reactMutex.release();
        })();
    }, []);

    return { polyfact, login, loading };
}
