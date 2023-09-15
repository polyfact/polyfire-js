import { useState } from "react";
import PolyfactClientBuilder, { Client } from "../client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export default function usePolyfact(
    args:
        | {
              projectId: string;
              endpoint?: string;
          }
        | string
        | null,
): Omit<Client, "auth"> & {
    auth: Omit<Client["auth"], "init"> & { status: AuthStatus };
} {
    let projectId: string | undefined;
    let endpoint = "https://api.polyfact.com";
    if (typeof args === "string") {
        projectId = args;
    } else if (typeof args === "object") {
        ({ projectId, endpoint = "https://api.polyfact.com" } = args || {});
    }

    if (!projectId) {
        throw new Error("No project specified");
    }

    const project = projectId;

    const [status, setStatus] = useState<AuthStatus>("loading");
    const [polyfact] = useState<Client>(() => {
        const client = PolyfactClientBuilder({ projectId: project, endpoint });

        client.auth.init().then((isAuthenticated) => {
            setStatus(isAuthenticated ? "authenticated" : "unauthenticated");
        });

        return client;
    });

    return {
        ...polyfact,
        auth: {
            ...polyfact.auth,
            status,
            login: async (input) => {
                setStatus("loading");
                const res = await polyfact.auth.login(input);
                setStatus("authenticated");
                return res;
            },
            logout: async () => {
                setStatus("loading");
                await polyfact.auth.logout();
                setStatus("unauthenticated");
            },
        },
    };
}
