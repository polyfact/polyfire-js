import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import * as t from "polyfact-io-ts";
import { Mutex } from "async-mutex";
import { POLYFACT_TOKEN, POLYFACT_ENDPOINT } from "./utils";
import generateClient, { generate, generateWithTokenUsage, GenerationOptions } from "./generate";
import generateWithTypeClient, {
    generateWithType,
    generateWithTypeWithTokenUsage,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { transcribe } from "./transcribe";
import chatClient, { Chat } from "./chats";
import memoryClient, { Memory, createMemory, updateMemory, getAllMemories } from "./memory";
import { splitString, tokenCount } from "./split";
import { InputClientOptions } from "./clientOpts";
import kvClient, { get as KVGet, set as KVSet } from "./kv";

const kv = {
    get: KVGet,
    set: KVSet,
};

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

function client(co: InputClientOptions) {
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
        this.isAuthTokenSetSync = true;
        this.buildQueue.push(async () => {
            await this.supabaseClient.auth.signInWithOAuth(credentials);
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

declare const window: any;

const reactMutex = new Mutex();

export function usePolyfact({
    project,
    endpoint,
}: {
    project: string;
    endpoint?: string;
}): [ReturnType<typeof client>, (input: { provider: "github" }) => Promise<void>, boolean] {
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

            if (!token && window.localStorage.getItem("polyfact_token")) {
                token = window.localStorage.getItem("polyfact_token");
            } else if (token) {
                window.localStorage.setItem("polyfact_token", token);
            }

            if (token) {
                const p = await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                    .project(project)
                    .signInWithToken(token);
                setLoading(false);
                setPolyfact(p);
            } else {
                setLogin(() => async ({ provider }: { provider: "github" }) => {
                    await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                        .project(project)
                        .signInWithOAuth({ provider });
                });
                setLoading(false);
            }

            reactMutex.release();
        })();
    }, []);

    return [polyfact, login, loading];
}
