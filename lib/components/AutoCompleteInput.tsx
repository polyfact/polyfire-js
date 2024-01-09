import React, { useState, useEffect, useCallback } from "react";
import { usePolyfire } from "../hooks";
import type { Generation } from "../generate";

export interface AutoCompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onChange?: React.InputHTMLAttributes<HTMLInputElement>["onChange"];
}

export function AutoCompleteInput({
    onChange: onChangeProps,
    ...props
}: AutoCompleteInputProps): React.ReactElement {
    const {
        auth: { status },
        models: { generate },
    } = usePolyfire();

    const [prompt, setPrompt] = useState<string>();
    const [scroll, setScroll] = useState<{ scrollLeft: number; scrollTop: number }>();

    const [completion, setCompletion] = useState<string>();
    const [previousTimeout, setPreviousTimeout] = useState<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const [previousGeneration, setPreviousGeneration] = useState<Generation | null>(null);

    useEffect(() => {
        // We need to stop the previous generations and timers to prevent the previous
        // to appear after a change.
        if (previousTimeout !== null) {
            clearTimeout(previousTimeout);
        }
        if (previousGeneration) {
            try {
                previousGeneration.stop();
                previousGeneration.destroy();
                setPreviousGeneration(null);
            } catch (_) {
                // For some reason, previousGeneration.stop seems to throw an error
                // when pasting some text. It might be due to a race condition if
                // multiple letters are typed too fast causing the previousGeneration.stop()
                // to be called multiple time on the same one ?
                // In any case, this error is unimportant and can be dismissed.
            }
        }

        if (status === "authenticated" && prompt) {
            setPreviousTimeout(
                // We wait 1 second wihout anything typed before completing anything
                // to avoid sending too many requests for nothing.
                setTimeout(() => {
                    const generation = generate(prompt, {
                        systemPrompt: `Your role is to predict what the user will type next.
                            Don't answer the user.
                            Only answer with the prediction until the end of the sentence.
                            Don't explain anything about the prediction. Don't repeat what the user said.
                            Complete from the where the user stopped typing.`,
                        autoComplete: true,
                    });
                    setPreviousGeneration(generation);
                    generation.then(setCompletion);
                }, 1000),
            );
        }
    }, [status, generate, prompt]);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const outputRef = React.useRef<HTMLDivElement>(null);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            setPrompt(e.target.value);

            const { scrollTop, scrollLeft } = e.target;
            setScroll({ scrollTop, scrollLeft });
            setCompletion("");

            if (onChangeProps) {
                onChangeProps(e);
            }
        },
        [onChangeProps],
    );

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (e.key === "Tab" && completion) {
                e.preventDefault();
                setPrompt((p) => {
                    if (inputRef.current && outputRef.current) {
                        inputRef.current.value = p + completion || "";

                        // We fully scroll left after a completion
                        inputRef.current.scrollLeft = 99999999;
                        outputRef.current.scrollLeft = 99999999;
                    }
                    return p + completion;
                });
                setCompletion("");
            }
        },
        [completion],
    );

    // We have to manually check that the scroll stays synchronized between the
    // div and the input
    const onScroll: React.UIEventHandler<HTMLInputElement> = useCallback((e) => {
        const { scrollTop, scrollLeft } = e.target as HTMLInputElement;
        setScroll({ scrollTop, scrollLeft });
    }, []);

    useEffect(() => {
        if (outputRef.current && scroll) {
            outputRef.current.scrollLeft = scroll.scrollLeft;
            outputRef.current.scrollTop = scroll.scrollTop;
        }
    }, [scroll]);

    // And we need to also manually synchronize the output size and position to
    // the input, to be sure it stays in the same place even if the style set in
    // the props gets too weird
    useEffect(() => {
        if (outputRef.current && inputRef.current) {
            outputRef.current.style.paddingLeft = `${
                inputRef.current.getBoundingClientRect().left -
                outputRef.current.getBoundingClientRect().left
            }px`;
            outputRef.current.style.paddingTop = `${
                inputRef.current.getBoundingClientRect().top -
                outputRef.current.getBoundingClientRect().top
            }px`;

            outputRef.current.style.width = `${inputRef.current.getBoundingClientRect().width}px`;
        }
    }, [outputRef, inputRef]);

    return (
        <label
            style={{
                display: "inline-block",
                minHeight: 16,
                minWidth: 176,
                fontSize: 13.33333,
                padding: "1px 2px",
                border: "2px solid #ccc",
                borderRadius: "3px",
                backgroundColor: "white",
                ...((props.style || {}) as React.LabelHTMLAttributes<HTMLLabelElement>["style"]),
                position: "relative",
            }}
        >
            {/*
                To allow to write the completion in a different color and for it
                not to be editable right away (until we use tab), we create a div
                behind the input that prints the input content as well as the
                completion and set the text color and backgroundColor of the
                input to transparent.

                This feels wrong and I'm not entirely sure it would withstand any
                css style/browser config used on this but I didn't found any other
                way.
            */}
            <div
                style={{
                    fontFamily: props?.style?.fontFamily || "Cantarell",
                    backgroundColor: "transparent",
                    fontSize: "inherit",
                    position: "absolute",
                    color: "inherit",
                    maxWidth: "inherit",
                    width: "100%",
                    height: "inherit",
                    overflow: "hidden",
                    padding: "0",
                    display: "inline",
                    whiteSpace: "pre",
                }}
                ref={outputRef}
            >
                {prompt}
                <span style={{ color: "grey" }}>{completion}</span>
            </div>
            <input
                {...props}
                style={{
                    fontFamily: props?.style?.fontFamily || "Cantarell",
                    caretColor: props?.style?.caretColor || "black",
                    fontSize: "inherit",
                    position: "relative",
                    width: "inherit",
                    minWidth: "100%",
                    maxWidth: "100%",
                    height: "inherit",
                    padding: 0,
                    border: 0,
                    display: "inline-block",
                    color: "transparent",
                    backgroundColor: "transparent",
                }}
                onChange={onChange}
                onScrollCapture={onScroll}
                onSelectCapture={onScroll}
                onKeyDown={onKeyDown}
                ref={inputRef}
            />
        </label>
    );
}
