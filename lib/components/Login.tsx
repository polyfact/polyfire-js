"use client";
import {
    GoogleLoginButton,
    MicrosoftLoginButton,
    GithubLoginButton,
} from "react-social-login-buttons";
import React, { ReactNode } from "react";
import { usePolyfire } from "../hooks";
import "./Login.css";

export interface LoginProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    termsOfService?: string;
    privacyPolicy?: string;
    providers?: string[];
}

export function Login({
    children,
    termsOfService,
    privacyPolicy,
    providers,
    ...props
}: LoginProps): React.ReactElement {
    const {
        auth: { status, login },
    } = usePolyfire();

    if (!providers) providers = ["github", "google", "azure"];

    if (status === "loading") {
        return (
            <div
                {...props}
                style={{
                    width: 240,
                    minHeight: 145,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    ...(props.style || {}),
                }}
            >
                <div style={{ width: 48, height: 48 }}>
                    <span className="polyfire-login-loader"></span>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div {...props} style={{ width: 240, minHeight: 145, ...(props.style || {}) }}>
                {providers.map((p) => {
                    switch (p) {
                        case "github":
                            return <GithubLoginButton onClick={() => login("github")} />;
                        case "google":
                            return <GoogleLoginButton onClick={() => login("google")} />;
                        case "azure":
                            return <MicrosoftLoginButton onClick={() => login("azure")} />;
                        default:
                            return null;
                    }
                })}
                {(termsOfService || privacyPolicy) && (
                    <p style={{ fontSize: 11, textAlign: "center" }}>
                        By continuing, you are indicating that you accept
                        {termsOfService && (
                            <>
                                {" "}
                                our{" "}
                                <a href={termsOfService} style={{ color: "blue" }}>
                                    Terms of service
                                </a>
                            </>
                        )}
                        {termsOfService && privacyPolicy && " and"}
                        {privacyPolicy && (
                            <>
                                {" "}
                                our{" "}
                                <a href={privacyPolicy} style={{ color: "blue" }}>
                                    Privacy Policy
                                </a>
                            </>
                        )}
                        .
                    </p>
                )}
            </div>
        );
    }

    return <>{children}</>;
}
