import axios, { AxiosError } from "axios";
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
import promptClient, { PromptClient } from "./prompt";
import { InputClientOptions, supabaseDefaultClient } from "./clientOpts";
import kvClient, { KVClient } from "./kv";
import imageGenerationClient, { ImageGenerationClient } from "./image";
import { ApiError, ErrorData } from "./helpers/error";

export type Client = GenerationClient &
    GenerationWithTypeClient &
    TranscribeClient &
    MemoryClient &
    ChatClient &
    UserClient &
    PromptClient &
    ImageGenerationClient & { kv: KVClient };

export function client(co: InputClientOptions): Client {
    return {
        ...generateClient(co),
        ...generateWithTypeClient(co),
        ...transcribeClient(co),
        ...memoryClient(co),
        ...chatClient(co),
        ...userClient(co),
        ...imageGenerationClient(co),
        ...promptClient(co),
        kv: kvClient(co),
    };
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

declare const window: any;

export class PolyfactClientBuilder implements PromiseLike<ReturnType<typeof client>> {
    private buildQueue: (() => Promise<void>)[] = [];

    private clientOptions: InputClientOptions = {
        endpoint: POLYFACT_ENDPOINT || "https://api.polyfact.com",
    };

    private authToken: Promise<string>;

    private authTokenResolve: (authToken: string) => void;

    private isAuthTokenSetSync: boolean;

    private supabaseClient: ReturnType<typeof createClient>;

    private authType: "token" | "firebase" = "token";

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

    signInWithOAuthToken(token: string): PolyfactClientBuilder {
        this.isAuthTokenSetSync = true;
        this.authType = "token";
        this.authTokenResolve(token);
        return this;
    }

    signInWithFirebaseToken(token: string): PolyfactClientBuilder {
        this.isAuthTokenSetSync = true;
        this.authType = "firebase";
        this.authTokenResolve(token);
        return this;
    }

    async getSession(): Promise<{ token?: string; email?: string }> {
        let token = new URLSearchParams(
            window.location.hash.replace(/^#+/, "#").replace(/^#/, "?"),
        ).get("access_token");
        let refreshToken = new URLSearchParams(
            window.location.hash.replace(/^#+/, "#").replace(/^#/, "?"),
        ).get("refresh_token");

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
            window.history.replaceState({}, window.document.title, ".");
        }

        if (refreshToken) {
            if (!token) {
                const { data } = await supabase.auth.refreshSession({
                    refresh_token: refreshToken,
                });

                token = data.session?.access_token || "";

                if (!token) {
                    this.clearSessionStorage();
                    return {};
                }

                window.localStorage.setItem("polyfact_refresh_token", data.session?.refresh_token);
            }

            const { data } = await supabase.auth.getUser(token);

            return { token, email: data.user?.email || "" };
        }

        return {};
    }

    clearSessionStorage(): void {
        window.localStorage.removeItem("polyfact_refresh_token");
    }

    signInWithPassword(credentials: { email: string; password: string }): PolyfactClientBuilder {
        this.isAuthTokenSetSync = true;
        this.authType = "token";
        this.buildQueue.push(async () => {
            const data = await this.supabaseClient.auth.signInWithPassword(credentials);

            if (!data?.data?.session?.access_token) {
                throw new Error("signInWithPassword failed");
            }

            this.authTokenResolve(data.data.session.access_token);
        });
        return this;
    }

    async oAuthRedirect(
        credentials: Awaited<
            Parameters<ReturnType<typeof createClient>["auth"]["signInWithOAuth"]>[0]
        >,
        browserRedirect = true,
    ): Promise<string> {
        if (typeof window === "undefined") {
            throw new Error("signInWithOAuth not usable outside of the browser environment");
        }
        this.isAuthTokenSetSync = true;
        const url = new Promise<string>((res, rej) =>
            this.buildQueue.push(async () => {
                const { data } = await this.supabaseClient.auth.signInWithOAuth({
                    ...credentials,
                    options: {
                        redirectTo: window?.location,
                        skipBrowserRedirect: !browserRedirect,
                    },
                });

                if (!data?.url) {
                    rej(new Error("signInWithOAuth failed"));
                    return;
                }

                res(data.url);
            }),
        );

        await this;

        return url;
    }

    project(projectId: string): PolyfactClientBuilder {
        this.buildQueue.push(async () => {
            if (projectId) {
                try {
                    const { data } = await axios.get(
                        `${(await this.clientOptions).endpoint}/project/${projectId}/auth/${
                            this.authType
                        }`,
                        { headers: { Authorization: `Bearer ${await this.authToken}` } },
                    );
                    (await this.clientOptions).token = data;
                } catch (e: unknown) {
                    if (e instanceof AxiosError) {
                        throw new ApiError(e?.response?.data as ErrorData);
                    }
                    throw e;
                }
            }
        });
        return this;
    }
}

const Polyfact = new PolyfactClientBuilder();

export default Polyfact;
