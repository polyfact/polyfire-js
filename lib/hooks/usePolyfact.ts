import { Mutex } from "async-mutex";
import { useState, useEffect } from "react";
import Polyfact, { Client } from "../client";

declare const window: any;

const reactMutex = new Mutex();

type SimpleProvider = "github" | "google";
type LoginWithFirebaseInput = { token: string; provider: "firebase" };
type LoginFunctionInput = SimpleProvider | { provider: SimpleProvider } | LoginWithFirebaseInput;

function loginFunctionBuilder({ project, endpoint }: { project: string; endpoint?: string }) {
    return async function loginFunction(input: LoginFunctionInput): Promise<Client> {
        if (typeof input === "object" && input.provider === "firebase") {
            return await Polyfact.endpoint(endpoint || "https://api.polyfact.com")
                .project(project)
                .signInWithFirebaseToken(input.token);
        }

        let provider: SimpleProvider;
        if (typeof input === "string") {
            provider = input;
        } else {
            provider = input.provider;
        }

        await Polyfact.endpoint(endpoint || "https://api.polyfact.com")
            .project(project)
            .oAuthRedirect({ provider });
        return new Promise<Client>(() => {});
    };
}

export default function usePolyfact(
    args:
        | {
              project: string;
              endpoint?: string;
          }
        | string
        | null,
): {
    polyfact: Client | undefined;
    login: ((input: LoginFunctionInput) => Promise<void>) | undefined;
    logout: () => Promise<void>;
    email?: string;
    loading: boolean;
    polyfactPromise: Promise<Client>;
} {
    let project: string | undefined;
    let endpoint: string | undefined;
    if (typeof args === "string") {
        project = args;
    } else if (typeof args === "object") {
        ({ project, endpoint } = args || {});
    }

    const [polyfact, setPolyfact] = useState<Client>();
    const [email, setEmail] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [allowLogin, setAllowLogin] = useState<boolean>(false);

    function initPolyfactPromise(): {
        promise: Promise<Client>;
        resolveFunction: (client: Client) => void;
    } {
        let resolveFunction: (client: Client) => void;
        const promise = new Promise<Client>((resolve) => {
            resolveFunction = resolve;
        });
        return { promise, resolveFunction: resolveFunction! };
    }

    const [polyfactPromise, setPolyfactPromise] = useState<ReturnType<typeof initPolyfactPromise>>(
        () => initPolyfactPromise(),
    );

    async function loginFunction(input: LoginFunctionInput) {
        if (project) {
            const p = await loginFunctionBuilder({ project, endpoint })(input);
            setAllowLogin(false);
            setPolyfact(p);
            polyfactPromise.resolveFunction(p);
            window.Polyfact = p;
        }
    }

    async function logout() {
        if (!loading && polyfact) {
            setPolyfact(undefined);
            setAllowLogin(true);
            setEmail(undefined);
            setPolyfactPromise(() => initPolyfactPromise());
            setLoading(false);
        } else {
            throw new Error("Polyfact is not initialized");
        }
    }

    useEffect(() => {
        if (project) {
            (async () => {
                await reactMutex.acquire();
                if (window.Polyfact) {
                    setPolyfact(window.Polyfact);
                    polyfactPromise.resolveFunction(window.Polyfact);
                    setEmail(window.PolyfactEmail);
                    setLoading(false);
                    reactMutex.release();
                    return;
                }

                const { token, email } = (await Polyfact.getSession()) || {};
                if (token) {
                    const p = await Polyfact.endpoint(endpoint || "https://api.polyfact.com")
                        .project(project)
                        .signInWithOAuthToken(token);
                    setLoading(false);
                    setPolyfact(p);
                    polyfactPromise.resolveFunction(p);
                    setEmail(email);
                    window.Polyfact = p;
                    window.PolyfactEmail = email;
                } else {
                    setAllowLogin(true);
                    setLoading(false);
                }

                reactMutex.release();
            })();
        } else {
            const getPolyfact = async () => {
                await reactMutex.acquire();
                if (window.Polyfact) {
                    setPolyfact(window.Polyfact);
                    polyfactPromise.resolveFunction(window.Polyfact);
                    setEmail(window.PolyfactEmail);
                    setLoading(false);
                    reactMutex.release();
                    return;
                }
                setLoading(true);
                setTimeout(getPolyfact, 50);
                reactMutex.release();
            };

            getPolyfact();
        }
    }, []);

    return {
        polyfact,
        login: allowLogin ? loginFunction : undefined,
        logout,
        loading,
        email,
        polyfactPromise: polyfactPromise.promise,
    };
}
