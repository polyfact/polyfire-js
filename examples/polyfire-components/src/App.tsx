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
import CodeDisplay from "./components/CodeDisplay";

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
                    <h1 style={headerStyle}> 🔥 Polyfire Component Demo</h1>

                    {/* Auto Completion Test Section */}
                    <div style={sectionStyle}>
                        <h2 style={headerSectionStyle}>Auto Completion Demo</h2>

                        {/* AutoCompleteInput */}

                        <h3 style={headerStyle}>AutoComplete Input Field</h3>
                        <AutoCompleteInput style={inputStyle} />
                        <CodeDisplay code={`<AutoCompleteInput />`} />

                        {/* AutoCompleteTextArea */}

                        <h3 style={headerStyle}>AutoComplete TextArea</h3>
                        <AutoCompleteTextArea style={inputStyle} />
                        <CodeDisplay code={`<AutoCompleteTextArea />`} />
                    </div>

                    {/* Generation Test Section */}
                    <div style={sectionStyle}>
                        <h2 style={headerSectionStyle}>Generation Demo</h2>

                        <h4 style={headerStyle}>Modify prompt to test components generation:</h4>
                        <input
                            type="text"
                            onChange={handleInputChange}
                            defaultValue={userInput}
                            style={inputStyle}
                        />

                        {/* ImageGenerated */}

                        <h2 style={headerStyle}>AI-Generated Image</h2>

                        <h3>Result</h3>
                        <ImageGenerated
                            prompt={userInput}
                            model={"dall-e-3"}
                            loadingElement={"Rendering..."}
                            style={imageStyle}
                        />

                        <h3>Code</h3>
                        <CodeDisplay
                            code={`<ImageGenerated prompt={"${userInput}"} model={"dall-e-3"} />`}
                        />

                        {/* TextGenerated */}

                        <h3 style={headerStyle}>Dynamic Text Generation</h3>

                        <h4>Result</h4>
                        <TextGenerated prompt={userInput} stream />

                        <h4>Code</h4>
                        <CodeDisplay code={`<TextGenerated prompt={"${userInput}"} stream} />`} />

                        {/* TextSummary */}

                        <h2 style={headerStyle}>Content Summarization</h2>

                        <h4>Result</h4>
                        <TextSummary prompt={userInput} stream />

                        <h4>Code</h4>
                        <CodeDisplay code={`<TextSummary prompt={"${userInput}"} stream />`} />

                        {/* TextTranslated */}

                        <h2 style={headerStyle}>Language Translation</h2>
                        <h4>Result</h4>
                        <TextTranslated text={userInput} language={"french"} />

                        <h4>Code</h4>
                        <CodeDisplay
                            code={`<TextTranslated text={"${userInput}"} language={"french"} />`}
                        />
                    </div>
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
    marginTop: "2rem",
    color: "#333",
    fontWeight: "bold",
};

const imageStyle = {
    width: "150px",
    height: "150px",
};

const inputStyle = {
    padding: "0.5rem 0rem",
    margin: "1rem 0",
    border: "1px solid #ddd",
    borderRadius: "0.25rem",
    width: "100%",
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

const sectionStyle = {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    margin: "40px 0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const headerSectionStyle = {
    ...headerStyle,
    borderBottom: "2px solid #eee",
    paddingBottom: "10px",
    marginBottom: "15px",
};

export default App;
