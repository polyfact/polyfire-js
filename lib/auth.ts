import axios, { AxiosError } from "axios";
import { Mutex } from "async-mutex";
import { createClient } from "@supabase/supabase-js";
import { ClientOptions, supabaseDefaultClient } from "./clientOpts";
import { MutablePromise } from "./utils";
import { ApiError, ErrorData } from "./helpers/error";

type SimpleProvider = "github" | "google";
type LoginWithFirebaseInput = { token: string; provider: "firebase" };
type LoginFunctionInput = SimpleProvider | { provider: SimpleProvider } | LoginWithFirebaseInput;

const supabaseClient = createClient(
    supabaseDefaultClient.supabaseUrl,
    supabaseDefaultClient.supabaseKey,
    {
        auth: { persistSession: false },
    },
);

declare const window: Window;

const getSessionMutex = new Mutex();

export async function getSession(projectId: string): Promise<{ token?: string; email?: string }> {
    return getSessionMutex.runExclusive(async () => {
        const storedProjectId = window.localStorage.getItem("polyfact_project_id");
        if (storedProjectId && storedProjectId !== projectId) {
            window.localStorage.removeItem("polyfact_refresh_token");
            window.localStorage.removeItem("polyfact_project_id");
        }

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
            window.localStorage.setItem("polyfact_project_id", projectId);
            window.history.replaceState({}, window.document.title, ".");
        }

        if (!refreshToken) {
            return {};
        }
        if (!token) {
            const { data } = await supabase.auth.refreshSession({
                refresh_token: refreshToken,
            });

            token = data.session?.access_token || "";

            if (!token || !data.session?.refresh_token) {
                window.localStorage.removeItem("polyfact_refresh_token");
                window.localStorage.removeItem("polyfact_project_id");
                return {};
            }

            window.localStorage.setItem("polyfact_refresh_token", data.session?.refresh_token);
            window.localStorage.setItem("polyfact_project_id", projectId);
        }
        return { token };
    });
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export async function oAuthRedirect(
    credentials: Awaited<Parameters<ReturnType<typeof createClient>["auth"]["signInWithOAuth"]>[0]>,
    browserRedirect = true,
): Promise<string> {
    if (typeof window === "undefined") {
        throw new Error("signInWithOAuth not usable outside of the browser environment");
    }

    const { data } = await supabaseClient.auth.signInWithOAuth({
        ...credentials,
        options: {
            redirectTo: `${window?.location}`,
            skipBrowserRedirect: !browserRedirect,
        },
    });

    if (!data?.url) {
        throw new Error("signInWithOAuth failed");
    }

    return data.url;
}

export async function signInWithOAuthToken(
    token: string,
    authType: "token" | "firebase",
    co: MutablePromise<Partial<ClientOptions>>,
    { project, endpoint }: { project: string; endpoint: string },
): Promise<void> {
    try {
        const { data } = await axios.get(`${endpoint}/project/${project}/auth/${authType}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        co.set({ token: data, endpoint });
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export async function login(
    input: LoginFunctionInput,
    projectOptions: { project: string; endpoint: string },
    co: MutablePromise<Partial<ClientOptions>>,
): Promise<void> {
    await co.deresolve();
    if (typeof input === "object" && input.provider === "firebase") {
        signInWithOAuthToken(input.token, "firebase", co, projectOptions);
        return;
    }

    const provider = typeof input === "string" ? input : input.provider;

    await oAuthRedirect({ provider });

    await new Promise((_res, _rej) => {});
}

export async function logout(co: MutablePromise<Partial<ClientOptions>>): Promise<void> {
    await co.deresolve();
    window.localStorage.removeItem("polyfact_refresh_token");
    window.localStorage.removeItem("polyfact_project_id");
    co.throw(new Error("You need to be authenticated to use this function"));
}

export async function init(
    co: MutablePromise<Partial<ClientOptions>>,
    projectOptions: { project: string; endpoint: string },
): Promise<boolean> {
    if (typeof window === "undefined") {
        co.throw(new Error("You need to be authenticated to use this function"));
        return false;
    }

    const session = await getSession(projectOptions.project);
    if (session.token) {
        await signInWithOAuthToken(session.token, "token", co, projectOptions);
        return true;
    }
    co.throw(new Error("You need to be authenticated to use this function"));
    return false;
}

export type AuthClient = {
    init: () => Promise<boolean>;
    login: (input: LoginFunctionInput) => Promise<void>;
    logout: () => Promise<void>;
};

export default function authClient(
    co: MutablePromise<Partial<ClientOptions>>,
    projectOptions: { project: string; endpoint: string },
): AuthClient {
    return {
        init: () => init(co, projectOptions),
        login: (input: LoginFunctionInput) => login(input, projectOptions, co),
        logout: () => logout(co),
    };
}
