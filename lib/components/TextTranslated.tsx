import React, { useState, useEffect } from "react";
import { usePolyfire } from "../hooks";

export interface TextTranslatedProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string;
    language: string;
    loadingElement?: React.JSX.Element | string;
}

export function TextTranslated({
    text,
    language,
    loadingElement,
    ...props
}: TextTranslatedProps): React.ReactElement {
    const {
        auth: { status },
        models: { generate },
    } = usePolyfire();

    const [translation, setTranslation] = useState<string>();

    useEffect(() => {
        setTranslation(undefined);

        if (status === "authenticated" && text) {
            generate(text, {
                systemPrompt: `Translate the text the user provided to this language: "${language}". Just say the translated text. Do not write anything else, do not write any explanation. Only write in the target language (${language})`,
                temperature: 0,
            }).then(setTranslation);
        }
    }, [status, generate, text]);

    if (translation) {
        return <div {...props}>{translation}</div>;
    }
    return <div {...props}>{loadingElement}</div>;
}
