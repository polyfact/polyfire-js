import React, { ReactNode, JSX, useState, createContext, useContext } from "react";
import PolyfireClientBuilder, { Client } from "../client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const PolyfireContext = createContext<{
    client: Client;
    status: AuthStatus;
    setStatus: (status: AuthStatus) => void;
} | null>(null);

export function PolyfireProvider({
    children,
    project,
    endpoint = "https://api.polyfire.com",
}: {
    children: ReactNode;
    project: string;
    endpoint?: string;
}): JSX.Element {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [polyfire] = useState<Client>(() => {
        const client = PolyfireClientBuilder({ project, endpoint });

        client.auth.init().then((isAuthenticated) => {
            setStatus(isAuthenticated ? "authenticated" : "unauthenticated");
        });

        return client;
    });

    return (
        <PolyfireContext.Provider
            value={{
                client: polyfire,
                status,
                setStatus,
            }}
        >
            {children}
        </PolyfireContext.Provider>
    );
}

export default function usePolyfire(): Omit<Client, "auth"> & {
    auth: Omit<Client["auth"], "init"> & { status: AuthStatus };
} {
    const polyfire = useContext(PolyfireContext);

    if (!polyfire) {
        throw new Error(
            "PolyfireProvider not found, did you forget to wrap your app in <PolyfireProvider>...</PolyfireProvider>?",
        );
    }

    const { client, status, setStatus } = polyfire;

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
