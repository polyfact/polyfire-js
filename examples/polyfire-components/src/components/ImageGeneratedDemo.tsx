import { ImageGenerated } from "polyfire-js/components";
import { ChangeEvent, useState } from "react";
import CodeDisplay from "./CodeDisplay";
import { useDebounce } from "../utils/debounce";

const ImageGeneratedDemo = () => {
    const [userInput, setUserInput] = useState("funny smiley with broken teeth");
    const [prompt, setPrompt] = useState("funny smiley with broken teeth");

    const [model, setModel] = useState("dall-e-3");

    const debouncedSetPrompt = useDebounce(setPrompt, 500);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setUserInput(value);

        debouncedSetPrompt(value);
    };

    return (
        <div className="mb-6">
            <h3 className="text-md bg-stone-800 font-bold mb-4">AI-Generated Image</h3>
            <div className="flex flex-col">
                <div>
                    <h4 className="font-semibold">Prompt</h4>
                    <textarea
                        value={userInput}
                        onChange={handleInputChange}
                        className="border border-stone-300 rounded px-2 py-1.5 mb-4 bg-stone-700 w-full"
                    />
                </div>

                <div>
                    <h4 className="font-semibold">Model</h4>
                    <select
                        className="border border-stone-300 rounded px-2 py-2 mb-4 bg-stone-700"
                        defaultValue="dall-e-3"
                        onChange={(e) => {
                            setModel(e.target.value);
                        }}
                    >
                        <option value="dall-e-3">Dall-E 3</option>
                        <option value="dall-e-2">Dall-E 2</option>
                    </select>
                </div>
            </div>

            <h4 className="font-semibold my-2">Result</h4>
            <ImageGenerated
                prompt={prompt}
                model={model}
                loadingElement={"Rendering..."}
                className="w-36 h-36 mb-4"
            />
            <h4 className="font-semibold my-2">Code</h4>
            <CodeDisplay code={`<ImageGenerated prompt={"${prompt}"} model={${model}} />`} />
        </div>
    );
};

export default ImageGeneratedDemo;
