import { createClient } from "@supabase/supabase-js";
import { Mutex } from "async-mutex";
import Polyfact, { Client, supabaseDefaultClient } from "../client";

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
    email?: string;
    loading: boolean;
} {
    const { project, endpoint } = args || {};
    if (typeof window === "undefined") {
        throw new Error("usePolyfact not usable outside of the browser environment");
    }

    const react = require("react"); // eslint-disable-line
    const [polyfact, setPolyfact] = react.useState();
    const [email, setEmail] = react.useState();
    const [loading, setLoading] = react.useState(true);
    const [login, setLogin] = react.useState();

    react.useEffect(() => {
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
                    const p = await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                        .project(project)
                        .signInWithOAuthToken(token);
                    setLoading(false);
                    setPolyfact(p);
                    setEmail(email);
                    window.Polyfact = p;
                    window.PolyfactEmail = email;
                } else {
                    setLogin(() => async ({ provider }: { provider: Provider }) => {
                        await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                            .project(project)
                            .oAuthRedirect({ provider });
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

    return { polyfact, login, loading, email };
}
