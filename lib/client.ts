import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { POLYFACT_TOKEN, POLYFACT_ENDPOINT } from "./utils";
import generateClient, { GenerationClient } from "./generate";
import generateWithTypeClient, {
    GenerationWithTypeClient,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { TranscribeClient } from "./transcribe";
import chatClient, { ChatClient } from "./chats";
import memoryClient, { MemoryClient } from "./memory";
import userClient, { UserClient } from "./user";
import { InputClientOptions } from "./clientOpts";
import kvClient, { KVClient } from "./kv";

export type Client = GenerationClient &
    GenerationWithTypeClient &
    TranscribeClient &
    MemoryClient &
    ChatClient &
    UserClient & { kv: KVClient };

function client(co: InputClientOptions): Client {
    return {
        ...generateClient(co),
        ...generateWithTypeClient(co),
        ...transcribeClient(co),
        ...memoryClient(co),
        ...chatClient(co),
        ...userClient(co),
        kv: kvClient(co),
    };
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export const supabaseDefaultClient = {
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
