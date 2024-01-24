"use client";

import React, { useState, useEffect } from "react";
import { usePolyfire } from "../hooks";

export interface ImageGeneratedProps extends React.HTMLAttributes<HTMLImageElement> {
    prompt: string;
    model: string;
    loadingElement?: React.JSX.Element | string;
}

export function ImageGenerated({
    prompt,
    loadingElement,
    model,
    ...props
}: ImageGeneratedProps): React.ReactElement {
    const {
        auth: { status },
        models: { generateImage },
    } = usePolyfire();

    const [imageUrl, setImageUrl] = useState<string>();

    useEffect(() => {
        if (status === "authenticated" && prompt) {
            setImageUrl(undefined);
            generateImage(prompt, { model }).then(({ url }) => setImageUrl(url));
        }
    }, [status, generateImage, prompt]);

    if (imageUrl) {
        return <img {...props} src={imageUrl} alt={prompt} />;
    }
    return <>{loadingElement}</>;
}
