import { ChangeEvent, useState } from "react";
import CodeDisplay from "./CodeDisplay";
import { TextTranslated } from "polyfire-js/components";
import { useDebounce } from "../utils/debounce";

const TextTranslatedDemo = () => {
    const [userInput, setUserInput] = useState("example text");
    const [prompt, setPrompt] = useState("example prompt");
    const [language, setLanguage] = useState("french");

    const debouncedSetPrompt = useDebounce(setPrompt, 500);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setUserInput(value);

        debouncedSetPrompt(value);
    };

    const handleLanguageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLanguage(value);
    };

    return (
        <div className="mb-6">
            <h3 className="text-md bg-stone-800 font-bold mb-4">Language Translation</h3>
            <div className="flex flex-col">
                <div>
                    <h4 className="font-semibold mb-2">Text</h4>
                    <textarea
                        value={userInput}
                        onChange={handleInputChange}
                        className="border border-stone-300 rounded px-2 py-1.5 mb-4 w-full bg-stone-700"
                        rows={3}
                    />
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Language</h4>
                    <input
                        value={language}
                        onChange={handleLanguageChange}
                        className="border border-stone-300 rounded px-2 py-1.5 mb-4 bg-stone-700"
                    />
                </div>
            </div>

            <h4 className="font-semibold my-2">Result</h4>
            <TextTranslated text={prompt} language={language} />

            <h4 className="font-semibold my-2">Code</h4>
            <CodeDisplay code={`<TextTranslated text={"${prompt}"} language={"${language}"} />`} />
        </div>
    );
};

export default TextTranslatedDemo;
