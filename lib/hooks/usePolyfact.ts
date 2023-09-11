import { Mutex } from "async-mutex";
import { useState, useEffect } from "react";
import Polyfact, { Client } from "../client";

declare const window: any;

const reactMutex = new Mutex();

type Provider = "github" | "google";

export default function usePolyfact(
    args: {
        project: string;
        endpoint?: string;
    } | null,
): {
    polyfact: Client | undefined;
    login: ((input: { provider: Provider }) => Promise<void>) | undefined;
    loginWithFirebase: ((token: string) => Promise<void>) | undefined;
    email?: string;
    loading: boolean;
} {
    const { project, endpoint } = args || {};
    const [polyfact, setPolyfact] = useState<Client>();
    const [email, setEmail] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [login, setLogin] = useState<
        ((input: { provider: Provider }) => Promise<void>) | undefined
    >();
    const [loginWithFirebase, setLoginWithFirebase] = useState<
        ((token: string) => Promise<void>) | undefined
    >();

    useEffect(() => {
        if (project) {
            (async () => {
                await reactMutex.acquire();
                if (window.Polyfact) {
                    setPolyfact(window.Polyfact);
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
                    setEmail(email);
                    window.Polyfact = p;
                    window.PolyfactEmail = email;
                } else {
                    setLogin(() => async ({ provider }: { provider: Provider }) => {
                        await Polyfact.endpoint(endpoint || "https://api.polyfact.com")
                            .project(project)
                            .oAuthRedirect({ provider });
                    });
                    setLoginWithFirebase(() => async (token: string) => {
                        const p = await Polyfact.endpoint(endpoint || "https://api.polyfact.com")
                            .project(project)
                            .signInWithFirebaseToken(token);
                        setLogin(undefined);
                        setLoginWithFirebase(undefined);
                        setPolyfact(p);
                        window.Polyfact = p;
                    });
                    setLoading(false);
                }

                reactMutex.release();
            })();
        } else {
            const getPolyfact = async () => {
                await reactMutex.acquire();
                if (window.Polyfact) {
                    setPolyfact(window.Polyfact);
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

    return { polyfact, login, loading, email, loginWithFirebase };
}
