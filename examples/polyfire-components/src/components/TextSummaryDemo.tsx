import { ChangeEvent, useState } from "react";
import CodeDisplay from "./CodeDisplay";
import { TextSummary } from "polyfire-js/components";
import { useDebounce } from "../utils/debounce";

const TextSummaryDemo = () => {
    const [userInput, setUserInput] = useState("example prompt");
    const [prompt, setPrompt] = useState("example prompt");

    const [stream, setStream] = useState(false);

    const debouncedSetPrompt = useDebounce(setPrompt, 500);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setUserInput(value);

        debouncedSetPrompt(value);
    };

    return (
        <div className="mb-6">
            <h3 className="text-md bg-stone-800 font-bold mb-4">Content Summarization</h3>
            <div className="flex flex-col">
                <div>
                    <h4 className="font-semibold mb-2 text-stone-100">Prompt</h4>
                    <textarea
                        value={userInput}
                        onChange={handleInputChange}
                        className="border border-stone-300 rounded px-2 py-1.5 mb-4 w-full bg-stone-700"
                        rows={1}
                    />
                </div>
                <div className="flex flex-row ">
                    <span className="font-semibold mr-2 block">Stream :</span>
                    <input
                        type="checkbox"
                        checked={stream}
                        onChange={(e) => setStream(e.target.checked)}
                        className="border border-stone-300 rounded bg-stone-700"
                    />
                </div>
            </div>

            <h4 className="font-semibold my-2">Result</h4>
            <TextSummary prompt={prompt} stream={stream} />

            <h4 className="font-semibold my-2">Code</h4>
            <CodeDisplay code={`<TextSummary prompt={"${prompt}"} stream={${stream}} />`} />
        </div>
    );
};

export default TextSummaryDemo;
