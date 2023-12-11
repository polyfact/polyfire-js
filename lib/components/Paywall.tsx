import React, { useState, useEffect } from "react";
import { usePolyfire } from "../hooks";

export interface PaywallProps {
    children: React.JSX.Element | React.JSX.Element[] | string;
    paymentLink: string;

    loading?: React.JSX.Element | React.JSX.Element[] | string;
    paywall?: (paymentLink: string) => React.JSX.Element;
}

export function Paywall({
    children,
    paymentLink,
    loading = "Loading ...",
    paywall = (paymentLink) => (
        <a href={paymentLink}>Click here to upgrade to premium and access the application</a>
    ),
}: PaywallProps): React.ReactElement {
    const {
        auth: {
            status,
            user: { getAuthID, usage },
        },
    } = usePolyfire();

    const [paywallStatus, setPaywallStatus] = useState<"loading" | "paywall" | "no-paywall">(
        "loading",
    );
    const [userId, setUserId] = useState<string>();

    useEffect(() => {
        if (status === "authenticated") {
            const updateUsage = async () => {
                const userId = await getAuthID();
                setUserId(userId);

                const userUsage = await usage();
                if (userUsage.rateLimit === undefined || userUsage.rateLimit === null) {
                    setPaywallStatus("no-paywall");
                } else {
                    setPaywallStatus(
                        userUsage.rateLimit <= userUsage.usage ? "paywall" : "no-paywall",
                    );
                }
            };

            updateUsage();
        }
    }, [status, getAuthID, usage]);

    switch (paywallStatus) {
        case "loading":
            return <>{loading}</>;
        case "no-paywall":
            return <>{children}</>;
        case "paywall":
            return paywall(`${paymentLink}?client_reference_id=${encodeURIComponent(userId || "")}`);
    }
}
