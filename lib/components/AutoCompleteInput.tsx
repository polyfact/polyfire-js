import React, { useState, useEffect, useCallback, CSSProperties, useRef } from "react";
import { usePolyfire } from "../hooks";
import type { Generation } from "../generate";

export interface AutoCompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    completionColor?: CSSProperties["color"];
    containerStyle?: CSSProperties;
    containerClassName?: string;
}

const containerStyle: CSSProperties = {
    maxWidth: "100%",
    minHeight: "2rem",
    position: "relative",
    alignItems: "center",
    display: "flex",
    overflow: "hidden",
};

const inputStyle: CSSProperties = {
    minHeight: "2rem",
    width: "100%",
    lineHeight: "2rem",
    paddingLeft: "0.25rem",
    paddingTop: "0",
    paddingBottom: "0",
    overflow: "hidden",
    border: "1px solid #ccc",
};

const completionStyle: CSSProperties = {
    position: "absolute",
    display: "flex",
    pointerEvents: "none",
    width: "auto",
    lineHeight: "2rem",
    paddingLeft: "0.5rem",
};

const hiddenSizerStyle: CSSProperties = {
    visibility: "hidden",
    position: "absolute",
    whiteSpace: "pre",
    maxWidth: "100%",
    overflow: "hidden",
};

export function AutoCompleteInput(props: AutoCompleteInputProps): React.ReactElement {
    const {
        completionColor = "grey",
        containerClassName,
        containerStyle: containerStyleProps,
        ...inputProps
    } = props;
    const {
        auth: { status },
        models: { generate },
    } = usePolyfire();

    const [prompt, setPrompt] = useState("");
    const [completion, setCompletion] = useState("");

    // This state is used to wait for the user to start typing again before initiating a new completion
    const [completionUsed, setCompletionUsed] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const hiddenSizerRef = useRef<HTMLSpanElement>(null);
    const completionRef = useRef<HTMLSpanElement>(null);
    const generationRef = useRef<Generation | null>(null);

    const updateCompletionPosition = () => {
        if (inputRef.current && hiddenSizerRef.current && completionRef.current) {
            hiddenSizerRef.current.innerText = prompt;
            const textWidth = hiddenSizerRef.current.offsetWidth;

            completionRef.current.style.left = `${textWidth}px`;
        }
    };

    const generateCompletion = useCallback(async () => {
        if (status !== "authenticated" || !prompt || completionUsed) return;

        try {
            const systemPrompt = `Your role is to predict what the user will type next. 
            Don't answer the user because there is only one user who speaks. 
            Only answer with the prediction until the end of the sentence. 
            Don't explain anything about the prediction. 
            Don't repeat what the user said. 
            Complete from where the user stopped typing.`;

            const generation = generate(prompt, { systemPrompt, autoComplete: true });
            generationRef.current = generation;

            const completion = await generation;
            const limitedCompletion = completion.split(" ").slice(0, 5).join(" ");

            setCompletion(limitedCompletion);
        } catch (error) {
            console.error("Error generating completion:", error);
        }
    }, [status, generate, prompt, completionUsed]);

    useEffect(() => {
        const timer = setTimeout(generateCompletion, 500);
        updateCompletionPosition();
        return () => {
            clearTimeout(timer);
            // We need to stop the previous generations and timers to prevent the previous
            // to appear after a change.
            if (generationRef.current) {
                try {
                    generationRef.current.stop();
                } catch (error) {
                    console.error("Error stopping generation:", error);
                }
                generationRef.current = null;
            }
        };
    }, [generateCompletion, prompt]);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setPrompt(e.target.value || "");
        setCompletion("");
        setCompletionUsed(false);
        updateCompletionPosition();

        props.onChange?.(e);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (e.key === "Tab" && completion) {
                e.preventDefault();
                setPrompt((prev) => {
                    const updatedPrompt = prev + completion;
                    setTimeout(() => {
                        if (inputRef.current) {
                            // We fully scroll left after a completion
                            inputRef.current.scrollLeft = 99999999;

                            inputRef.current.setSelectionRange(
                                updatedPrompt.length,
                                updatedPrompt.length,
                            );
                        }
                    }, 0);
                    return updatedPrompt;
                });
                setCompletion("");
                setCompletionUsed(true);
            }
        },
        [completion],
    );

    return (
        <div style={{ ...containerStyle, ...containerStyleProps }} className={containerClassName}>
            <input
                {...inputProps}
                ref={inputRef}
                value={prompt}
                onChange={onChange}
                onKeyDown={onKeyDown}
                style={{ ...inputStyle, ...props.style }}
                className={props.className}
            />
            <span ref={hiddenSizerRef} style={hiddenSizerStyle} />
            <span ref={completionRef} style={{ ...completionStyle, color: completionColor }}>
                {completion}
            </span>
        </div>
    );
}
