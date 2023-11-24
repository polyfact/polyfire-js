import React, { useState, useEffect, useCallback } from "react";
import { usePolyfire } from "polyfire-js/hooks";
import type { Generation } from "polyfire-js/generate";

export interface AutoCompleteTextAreaProps extends React.HTMLAttributes<HTMLElement> {
    onChange?: React.HTMLAttributes<HTMLTextAreaElement>["onChange"];
}

export function AutoCompleteTextArea({
    onChange: onChangeProps,
    ...props
}: AutoCompleteTextAreaProps): React.ReactElement {
    const {
        auth: { status },
        models: { generate },
    } = usePolyfire();

    const [prompt, setPrompt] = useState<string>("");

    const [completion, setCompletion] = useState<{ text: string; position: number }>({
        text: "",
        position: 0,
    });

    const [caretPosition, setCaretPosition] = useState<number>(0);

    const [previousTimeout, setPreviousTimeout] = useState<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const [previousGeneration, setPreviousGeneration] = useState<Generation | null>(null);

    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const outputRef = React.useRef<HTMLDivElement>(null);
    const insideOutputRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previousGeneration) {
            try {
                setCompletion({ text: "", position: caretPosition });
                previousGeneration.destroy();
                previousGeneration.stop();
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
            if (inputRef.current) {
                const promptBeforeCursor = prompt.slice(0, caretPosition);

                // We need to stop the previous generations and timers to prevent the previous
                // to appear after a change.
                // TODO: For some reason it doesn't work anymore even though it worked with the
                // input version. I don't understand and the workaround I thought about don't
                // seem to work either ...
                if (previousTimeout !== null) {
                    clearTimeout(previousTimeout);
                }
                setPreviousTimeout(
                    // We wait 1 second wihout anything typed before completing anything
                    // to avoid sending too many requests for nothing.
                    setTimeout(() => {
                        const generation = generate(promptBeforeCursor, {
                            systemPrompt: `Your role is to predict what the user will type next.
                            Don't answer the user.
                            Only answer with the prediction until the end of the sentence.
                            Don't explain anything about the prediction. Don't repeat what the user said.
                            Complete from the where the user stopped typing.`,
                            autoComplete: true,
                        });
                        setPreviousGeneration(generation);
                        generation.then((text) => setCompletion({ text, position: caretPosition }));
                    }, 1000),
                );
            }
        }
    }, [status, generate, prompt, caretPosition]);

    // We need manually synchronize the output size, position and the scroll to
    // the input, to be sure it stays in the same place even if the style set in
    // the props gets too weird
    const resynchronize = useCallback(() => {
        if (outputRef.current && inputRef.current && insideOutputRef.current) {
            (window as any).outputRef = outputRef.current;
            (window as any).insideOutputRef = insideOutputRef.current;
            (window as any).inputRef = inputRef.current;
            insideOutputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
            insideOutputRef.current.style.height = `${inputRef.current.scrollHeight + 4}px`;
            outputRef.current.style.paddingLeft = `${
                inputRef.current.getBoundingClientRect().left -
                outputRef.current.getBoundingClientRect().left
            }px`;
            outputRef.current.style.paddingTop = `${
                inputRef.current.getBoundingClientRect().top -
                outputRef.current.getBoundingClientRect().top
            }px`;

            outputRef.current.scrollLeft = inputRef.current.scrollLeft;
            outputRef.current.scrollTop = inputRef.current.scrollTop;
        }
    }, [outputRef, inputRef, insideOutputRef]);

    useEffect(() => {
        resynchronize();
        if (inputRef.current) {
            new ResizeObserver(resynchronize).observe(inputRef.current);
        }
    }, [resynchronize, inputRef]);

    const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
        (e) => {
            setPrompt(e.target.value);

            setCompletion({ text: "", position: 0 });

            resynchronize();

            if (onChangeProps) {
                onChangeProps(e);
            }
        },
        [onChangeProps, resynchronize],
    );

    // This callback needs to be called everytime the caret might change.
    // onKeyDown and onMouseDown should be enough.
    const checkCaretMove = useCallback(() => {
        if (caretPosition !== inputRef.current?.selectionStart) {
            setCaretPosition(inputRef.current?.selectionStart || 0);
            setCompletion({ text: "", position: 0 });
        }
    }, []);

    const onScroll: React.UIEventHandler<HTMLTextAreaElement> = useCallback(
        () => resynchronize(),
        [resynchronize],
    );

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback((e) => {
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

            checkCaretMove();
        }
        checkCaretMove();
    }, []);

    return (
        <label
            {...(props as React.HTMLAttributes<HTMLElement>)}
            style={{
                display: "inline-block",
                minHeight: 16,
                minWidth: 176,
                fontSize: 13.33333,
                padding: "1px 2px",
                border: "2px solid #ccc",
                borderRadius: "3px",
                backgroundColor: "white",
                ...(props.style || {}),
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
                    height: "100%",
                    overflow: "hidden",
                    padding: "0",
                    display: "inline",
                }}
                ref={outputRef}
            >
                <div
                    style={{
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                    }}
                    onResize={resynchronize}
                    ref={insideOutputRef}
                >
                    <span>{prompt.slice(0, completion.position)}</span>

                    {/*
                        Using the absolute position makes its width not move the
                        next span. We also add a background color for this one so
                        the completion and prompt don't merge in a diabolic way.
                        Might break if the background isn't just a color tho.
                    */}
                    <span
                        style={{
                            position: "absolute",
                            color: "grey",
                            backgroundColor: props.style?.backgroundColor || "white",
                        }}
                    >
                        {completion.text}
                    </span>

                    <span>{prompt.slice(completion.position)}</span>
                </div>
            </div>
            <textarea
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
                onMouseDown={checkCaretMove}
                onResize={resynchronize}
                ref={inputRef}
            />
        </label>
    );
}
