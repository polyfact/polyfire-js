"use client";

import React, { ReactNode, JSX, useState, createContext, useContext, useEffect } from "react";
import PolyfireClientBuilder, { Client } from "../client";
import { PolyfireError } from "../helpers/error";

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
    autoLogin,
}: {
    children: ReactNode;
    project: string;
    endpoint?: string;
    autoLogin?: boolean;
}): JSX.Element {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [polyfire] = useState<Client>(() => PolyfireClientBuilder({ project, endpoint }));

    useEffect(() => {
        polyfire.auth.init(autoLogin).then((isAuthenticated) => {
            setStatus(isAuthenticated ? "authenticated" : "unauthenticated");
        });
    }, []);

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
        throw new PolyfireError(
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
