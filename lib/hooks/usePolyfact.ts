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

                            reactMutex.release();
                            return;
                        }

                        window.localStorage.setItem(
                            "polyfact_refresh_token",
                            data.session?.refresh_token,
                        );
                    }

                    const { data } = await supabase.auth.getUser(token);

                    setEmail(data.user?.email);
                    const p = await Polyfact.endpoint(endpoint || "https://api2.polyfact.com")
                        .project(project)
                        .signInWithToken(token);
                    setLoading(false);
                    setPolyfact(p);
                    window.Polyfact = p;
                    window.PolyfactEmail = data.user?.email;
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
