import React, { ReactNode, JSX, useState, createContext, useContext } from "react";
import PolyfactClientBuilder, { Client } from "../client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const PolyfactContext = createContext<{
    client: Client;
    status: AuthStatus;
    setStatus: (status: AuthStatus) => void;
} | null>(null);

export function PolyfactProvider({
    children,
    project,
    endpoint = "https://api.polyfact.com",
}: {
    children: ReactNode;
    project: string;
    endpoint?: string;
}): JSX.Element {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [polyfact] = useState<Client>(() => {
        const client = PolyfactClientBuilder({ projectId: project, endpoint });

        client.auth.init().then((isAuthenticated) => {
            setStatus(isAuthenticated ? "authenticated" : "unauthenticated");
        });

        return client;
    });

    return (
        <PolyfactContext.Provider
            value={{
                client: polyfact,
                status,
                setStatus,
            }}
        >
            {children}
        </PolyfactContext.Provider>
    );
}

export default function usePolyfact(): Omit<Client, "auth"> & {
    auth: Omit<Client["auth"], "init"> & { status: AuthStatus };
} {
    const polyfact = useContext(PolyfactContext);

    if (!polyfact) {
        throw new Error(
            "PolyfactProvider not found, did you forget to wrap your app in <PolyfactProvider>...</PolyfactProvider>?",
        );
    }

    const { client, status, setStatus } = polyfact;

    return {
        ...client,
        auth: {
            ...client.auth,
            status,
            login: async (input) => {
                setStatus("loading");
                const res = await client.auth.login(input);
                setStatus("authenticated");
                return res;
            },
            logout: async () => {
                setStatus("loading");
                await client.auth.logout();
                setStatus("unauthenticated");
            },
        },
    };
}
