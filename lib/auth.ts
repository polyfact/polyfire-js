import axios, { AxiosError } from "axios";
import { Buffer } from "buffer";
import { Mutex } from "async-mutex";
import { ClientOptions } from "./clientOpts";
import { MutablePromise } from "./utils";
import { PolyfireError, ApiError, ErrorData } from "./helpers/error";

type SimpleProvider = "github" | "google" | "azure";
type LoginWithFirebaseInput = { token: string; provider: "firebase" };
type LoginWithCustomInput = { token: string; provider: "custom" };
type LoginWithRawPolyfireTokenInput = { token: string; provider: "raw-polyfire" };
type LoginAnonymousInput = { provider: "anonymous"; email?: string };
type LoginFunctionInput =
    | SimpleProvider
    | { provider: SimpleProvider }
    | LoginWithFirebaseInput
    | LoginWithCustomInput
    | LoginAnonymousInput
    | LoginWithRawPolyfireTokenInput;

declare const window: Window;

const getSessionMutex = new Mutex();

function setSessionStorage(refreshToken: string, projectId: string) {
    window.localStorage.setItem("polyfire_refresh_token", refreshToken);
    window.localStorage.setItem("polyfire_project_id", projectId);
}

function clearSessionStorage() {
    window.localStorage.removeItem("polyfire_refresh_token");
    window.localStorage.removeItem("polyfire_project_id");
}

function getSessionStorage(): { refreshToken: string | null; projectId: string | null } {
    const refreshToken = window.localStorage.getItem("polyfire_refresh_token");
    const projectId = window.localStorage.getItem("polyfire_project_id");
    return { refreshToken, projectId };
}

export async function getSession(
    projectId: string,
    { endpoint }: { endpoint: string },
): Promise<{ token?: string; email?: string }> {
    return getSessionMutex.runExclusive(async () => {
        let { refreshToken: storedRefreshToken, projectId: storedProjectId } = getSessionStorage();
        if (storedProjectId && storedProjectId !== projectId) {
            clearSessionStorage();
            storedRefreshToken = null;
            storedProjectId = null;
        }

        let token = new URLSearchParams(
            window.location.hash.replace(/^#+/, "#").replace(/^#/, "?"),
        ).get("access_token");
        let refreshToken = new URLSearchParams(
            window.location.hash.replace(/^#+/, "#").replace(/^#/, "?"),
        ).get("refresh_token");

        if (!refreshToken && storedRefreshToken) {
            refreshToken = storedRefreshToken;
        } else if (refreshToken) {
            setSessionStorage(refreshToken, projectId);

            // cleanURLFromTokens removes access_token and refresh_token from the URL
            // Required otherwise other useful link params are lost
            const cleanURLFromTokens = () => {
                const url = new URL(window.location.href);
                if (url.hash.includes("access_token") || url.hash.includes("refresh_token")) {
                    const hashParams = url.hash
                        .substring(1)
                        .split("&")
                        .reduce((acc: { [key: string]: string }, current) => {
                            const [key, value] = current.split("=");
                            acc[key] = value;
                            return acc;
                        }, {});

                    delete hashParams.access_token;
                    delete hashParams.refresh_token;

                    const newHash = Object.entries(hashParams)
                        .map(([key, value]) => `${key}=${value}`)
                        .join("&");

                    window.history.replaceState(
                        {},
                        window.document.title,
                        `${url.pathname}${url.search}${newHash ? `#${newHash}` : ""}`,
                    );
                }
            };
            cleanURLFromTokens();
        }

        if (!refreshToken) {
            return {};
        }
        if (!token) {
            const { data } = await axios.post(
                `${endpoint}/project/${projectId}/auth/provider/refresh`,
                {
                    refresh_token: refreshToken,
                },
            );

            token = data?.access_token || "";

            if (!token || !data?.refresh_token) {
                clearSessionStorage();
                return {};
            }

            setSessionStorage(data?.refresh_token, projectId);
        }
        return { token };
    });
}

export function oAuthRedirect(
    { project, provider, endpoint }: { project: string; provider: string; endpoint: string },
    browserRedirect = true,
): string {
    if (typeof window === "undefined") {
        throw new PolyfireError("signInWithOAuth not usable outside of the browser environment");
    }

    const url = `${endpoint}/project/${project}/auth/provider/redirect?provider=${provider}&redirect_to=${encodeURIComponent(
        `${window?.location}`,
    )}`;

    if (browserRedirect) {
        window.location = url;
    }

    return url;
}

export async function signInWithOAuthToken(
    token: string,
    authType: "firebase" | "custom",
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

export async function signInAnon(
    email: string | undefined,
    co: MutablePromise<Partial<ClientOptions>>,
    { project, endpoint }: { project: string; endpoint: string },
): Promise<void> {
    let basic = "auto";
    if (email) {
        basic = Buffer.from(email).toString("base64");
    }
    try {
        const { data } = await axios.get(`${endpoint}/project/${project}/auth/anonymous`, {
            headers: { Authorization: `Basic ${basic}` },
        });

        co.set({ token: data, endpoint });
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export async function signInWithPolyfireToken(
    token: string,
    co: MutablePromise<Partial<ClientOptions>>,
    { endpoint }: { project: string; endpoint: string },
): Promise<void> {
    co.set({ token, endpoint });
}

export async function login(
    input: LoginFunctionInput,
    projectOptions: { project: string; endpoint: string },
    co: MutablePromise<Partial<ClientOptions>>,
): Promise<void> {
    await co.deresolve();
    if (
        typeof input === "object" &&
        (input.provider === "firebase" || input.provider === "custom")
    ) {
        await signInWithOAuthToken(input.token, input.provider, co, projectOptions);
        return;
    }

    if (typeof input === "object" && input.provider === "anonymous") {
        await signInAnon(input.email, co, projectOptions);
        return;
    }

    if (typeof input === "object" && input.provider === "raw-polyfire") {
        await signInWithPolyfireToken(input.token, co, projectOptions);
        return;
    }

    const provider = typeof input === "string" ? input : input.provider;

    oAuthRedirect({ provider, ...projectOptions });

    await new Promise((_res, _rej) => {});
}

export async function logout(co: MutablePromise<Partial<ClientOptions>>): Promise<void> {
    await co.deresolve();
    clearSessionStorage();
    co.throw(new PolyfireError("You need to be authenticated to use this function"));
}

export async function init(
    co: MutablePromise<Partial<ClientOptions>>,
    projectOptions: { project: string; endpoint: string },
    autoLogin = true,
): Promise<boolean> {
    try {
        if (!autoLogin) {
            throw new PolyfireError("Auto login disabled");
        }
        await signInAnon(undefined, co, projectOptions);
        return true;
    } catch (e) {
        if (typeof window === "undefined") {
            co.throw(new PolyfireError("You need to be authenticated to use this function"));
            return false;
        }

        const session = await getSession(projectOptions.project, projectOptions).catch(() => {
            clearSessionStorage();
            return {} as { token?: string; email?: string };
        });
        if (session.token) {
            co.set({ token: session.token, endpoint: projectOptions.endpoint });
            return true;
        }

        co.throw(new PolyfireError("You need to be authenticated to use this function"));
        return false;
    }
}

export type AuthClient = {
    init: (autoLogin?: boolean) => Promise<boolean>;
    login: (input: LoginFunctionInput) => Promise<void>;
    logout: () => Promise<void>;
};

export default function authClient(
    co: MutablePromise<Partial<ClientOptions>>,
    projectOptions: { project: string; endpoint: string },
): AuthClient {
    return {
        init: (autoLogin) => init(co, projectOptions, autoLogin),
        login: (input: LoginFunctionInput) => login(input, projectOptions, co),
        logout: () => logout(co),
    };
}
