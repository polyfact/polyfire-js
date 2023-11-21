import React, { useState, useEffect } from "react";
import { usePolyfire } from "../hooks";
import type { Generation } from "../generate";

export interface TextGeneratedProps extends React.HTMLAttributes<HTMLDivElement> {
    prompt: string;
    stream?: boolean;
    loadingElement?: React.JSX.Element | string;
}

export function TextGenerated({
    prompt,
    stream,
    loadingElement,
    ...props
}: TextGeneratedProps): React.ReactElement {
    const {
        auth: { status },
        models: { generate },
    } = usePolyfire();

    const [text, setText] = useState<string>();
    const [currentStream, setCurrentStream] = useState<Generation>();

    useEffect(() => {
        // In case the stream or generate props changed, or the user logged out
        // we stop the current stream and reset the text
        if (currentStream) {
            currentStream.destroy();
        }
        setText(undefined);

        if (status === "authenticated" && prompt) {
            const newGeneration = generate(prompt);

            setCurrentStream(newGeneration);

            if (stream) {
                newGeneration.on("data", (data: string) => {
                    setText((t) => (t || "") + data);
                });
            } else {
                newGeneration.then(setText);
            }
        }
    }, [status, generate, prompt, stream]);

    if (text) {
        return <div {...props}>{text}</div>;
    }
    return <div {...props}>{loadingElement}</div>;
}
