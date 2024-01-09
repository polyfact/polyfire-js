import { useState, ChangeEvent, useRef, useEffect, useCallback } from "react";
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
                <div className="p-8 font-sans">
                    <h1 className="text-xl text-gray-800 font-bold mb-6">
                        Reminder: Update the Project Configuration in src/index.tsx
                    </h1>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md cursor-pointer font-semibold"
                        onClick={() => login("github")}
                    >
                        Authenticate with GitHub
                    </button>
                </div>
            ) : status === "authenticated" ? (
                <div className="p-8 font-sans">
                    <h1 className="text-2xl text-blue-800 font-bold mb-8">
                        🔥 Polyfire Components Demo
                    </h1>

                    {/* Auto Completion Test Section */}
                    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-10">
                        <h2 className="text-lg text-gray-800 font-bold mb-5 border-b border-gray-200 pb-2">
                            Auto Completion Demo
                        </h2>

                        <h3 className="text-md text-gray-800 font-semibold mb-4">
                            AutoComplete Input Field
                        </h3>
                        <AutoCompleteInput
                            placeholder="Type something here..."
                            className="py-2 px-3 border border-gray-300 bg-black rounded-md w-full mb-4"
                        />
                        <CodeDisplay code={`<AutoCompleteInput />`} />

                        <h3 className="text-md text-gray-800 font-semibold mb-4">
                            AutoComplete TextArea
                        </h3>
                        <AutoCompleteTextArea
                            placeholder="Type something here..."
                            className="py-2 px-3 border border-gray-300 rounded-md w-full mb-4"
                        />
                        <CodeDisplay code={`<AutoCompleteTextArea />`} />
                    </div>

                    {/* Generation Test Section */}
                    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                        <h2 className="text-lg text-gray-800 font-bold mb-5 border-b border-gray-200 pb-2">
                            Generation Demo
                        </h2>

                        <div className="mb-6">
                            <h4 className="text-md text-gray-800 font-semibold mb-4">
                                Modify prompt to test components generation:
                            </h4>
                            <input
                                type="text"
                                onChange={handleInputChange}
                                defaultValue={userInput}
                                className="py-2 px-3 border border-gray-300 rounded-md w-full mb-4"
                            />
                        </div>

                        <hr className="my-6 border-t border-gray-300" />

                        {/* ImageGenerated */}
                        <div className="mb-6">
                            <h3 className="text-md text-gray-800 font-bold mb-4">
                                AI-Generated Image
                            </h3>
                            <h4 className="font-semibold mb-2">Result</h4>
                            <ImageGenerated
                                prompt={userInput}
                                model={"dall-e-3"}
                                loadingElement={"Rendering..."}
                                className="w-36 h-36 mb-4"
                            />
                            <h4 className="font-semibold my-2">Code</h4>
                            <CodeDisplay
                                code={`<ImageGenerated prompt={"${userInput}"} model={"dall-e-3"} />`}
                            />
                        </div>

                        <hr className="my-6 border-t border-gray-300" />

                        {/* TextGenerated */}
                        <div className="mb-6">
                            <h3 className="text-md text-gray-800 font-bold mb-4">
                                Dynamic Text Generation
                            </h3>
                            <h4 className="font-semibold mb-2">Result</h4>
                            <TextGenerated prompt={userInput} stream />
                            <h4 className="font-semibold my-2">Code</h4>
                            <CodeDisplay
                                code={`<TextGenerated prompt={"${userInput}"} stream} />`}
                            />
                        </div>

                        <hr className="my-6 border-t border-gray-300" />

                        {/* TextSummary */}
                        <div className="mb-6">
                            <h3 className="text-md text-gray-800 font-bold mb-4">
                                Content Summarization
                            </h3>
                            <h4 className="font-semibold mb-2">Result</h4>
                            <TextSummary prompt={userInput} stream />
                            <h4 className="font-semibold my-2">Code</h4>
                            <CodeDisplay code={`<TextSummary prompt={"${userInput}"} stream />`} />
                        </div>

                        <hr className="my-6 border-t border-gray-300" />

                        {/* TextTranslated */}
                        <div className="mb-6">
                            <h3 className="text-md text-gray-800 font-bold mb-4">
                                Language Translation
                            </h3>
                            <h4 className="font-semibold mb-2">Result</h4>
                            <TextTranslated text={userInput} language={"french"} />
                            <h4 className="font-semibold my-2">Code</h4>
                            <CodeDisplay
                                code={`<TextTranslated text={"${userInput}"} language={"french"} />`}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                "Initializing Components..."
            )}
        </>
    );
}

export default App;
