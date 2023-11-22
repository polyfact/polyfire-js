import React, { useState, useEffect, useCallback } from "react";
import { usePolyfire } from "../hooks";
import type { Generation } from "../generate";

export function AutoCompleteInput({
    ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
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
                        // TODO: This prompt doesn't work very well, I think a fix
                        // will need to be done on the API side before deploying.
                        systemPrompt: `Your role is to predict what the user will type next.
                            Don't answer the user.
                            Only answer with the prediction until the end of the sentence.
                            Don't forget punctation or spaces at the begining if needed don't say anything else.
                            Don't explain anything about the prediction. Don't repeat what the user said.
                            Complete from the where the user stopped typing.`,
                    });

                    setPreviousGeneration(generation);
                    generation.then(setCompletion);
                }, 1000),
            );
        }
    }, [status, generate, prompt]);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const outputRef = React.useRef<HTMLDivElement>(null);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setPrompt(e.target.value);

        const { scrollTop, scrollLeft } = e.target;
        setScroll({ scrollTop, scrollLeft });
        setCompletion("");
    }, []);

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (e.key === "Tab" && completion) {
                e.preventDefault();
                setPrompt((p) => {
                    if (inputRef.current && outputRef.current) {
                        inputRef.current.value = p + completion || "";

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

    return (
        <label
            style={{
                position: "relative",
                display: "inline-block",
                minHeight: 16,
                minWidth: 176,
                fontSize: 13.33333,
                ...(props.style || {}),
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

                This will probably needs some adjusting and more custom thing to
                be sure each css style is set for the right element.

                The default style of the input should probably be reset and
                recreated on the label, then we could avoid passing the props.style
                to input and probably avoid a few bugs.
            */}
            <div
                style={{
                    fontFamily: props?.style?.fontFamily || "Cantarell",
                    backgroundColor: props?.style?.backgroundColor || "white",
                    border: "2px solid transparent",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    padding: "1px 2px",
                    paddingRight: "0px",
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
                    fontFamily: "Cantarell",
                    caretColor: "black",
                    ...(props.style || {}),
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "1px 2px",
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
