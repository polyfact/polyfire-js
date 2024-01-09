import React, { useState, ChangeEvent, useRef, useEffect, useCallback } from "react";
import { usePolyfire } from "polyfire-js/hooks";
import {
    AutoCompleteInput,
    AutoCompleteTextArea,
    ImageGenerated,
    TextGenerated,
    TextSummary,
    TextTranslated,
} from "polyfire-js/components";
import debounce from "lodash.debounce";

export function useDebounce<Params extends unknown[], Return>(
    cb: (...args: Params) => Return,
    delay: number,
): (...args: Params) => Return {
    const cbRef = useRef(cb);
    useEffect(() => {
        cbRef.current = cb;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(
        debounce((...args: Params) => cbRef.current(...args), delay) as (...args: Params) => Return,
        [delay],
    );
}

function App() {
    const {
        auth: { login, status },
    } = usePolyfire();

    const [userInput, setUserInput] = useState("funny smiley with broken teeth");

    const debouncedSetUserInput = useDebounce(setUserInput, 500);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        debouncedSetUserInput(value);
    };

    return (
        <>
            {status === "unauthenticated" ? (
                <div style={containerStyle}>
                    <h1 style={headerStyle}>
                        Reminder: Update the Project Configuration in src/index.tsx
                    </h1>
                    <p>
                        <button style={buttonStyle} onClick={() => login("github")}>
                            Authenticate with GitHub
                        </button>
                    </p>
                </div>
            ) : status === "authenticated" ? (
                <div style={containerStyle}>
                    <h1 style={headerStyle}>Polyfire component tests</h1>
                    <h2 style={headerStyle}>AutoComplete Input Field</h2>
                    <AutoCompleteInput style={inputStyle} />
                    <h2 style={headerStyle}>AutoComplete TextArea</h2>
                    <AutoCompleteTextArea style={inputStyle} />

                    <h4 style={headerStyle}>Modify prompt to test component generation :</h4>
                    <input
                        type="text"
                        onChange={handleInputChange}
                        defaultValue={userInput}
                        style={inputStyle}
                    />
                    <h1 style={headerStyle}>AI-Generated Imagery</h1>
                    <ImageGenerated
                        prompt={userInput}
                        model={"dall-e-3"}
                        loadingElement={"Rendering..."}
                        style={imageStyle}
                    />
                    <h1 style={headerStyle}>Dynamic Text Generation</h1>
                    <TextGenerated prompt={userInput} stream={true} />
                    <h1 style={headerStyle}>Content Summarization</h1>
                    <TextSummary prompt={userInput} stream={true} />
                    <h1 style={headerStyle}>Language Translation</h1>
                    <TextTranslated text={userInput} language={"french"} />
                </div>
            ) : (
                "Initializing Components..."
            )}
        </>
    );
}

const containerStyle = {
    padding: "2rem",
    fontFamily: "'Arial', sans-serif",
};

const headerStyle = {
    marginBottom: "1rem",
    color: "#333",
    fontWeight: "bold",
};

const imageStyle = {
    width: "150px",
    height: "150px",
};

const inputStyle = {
    padding: "0.5rem 1rem",
    margin: "1rem 0",
    border: "1px solid #ddd",
    borderRadius: "0.25rem",
    width: "90vw",
};

const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontWeight: "bold",
};

export default App;
