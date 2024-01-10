import { usePolyfire } from "polyfire-js/hooks";
import { AutoCompleteInput, AutoCompleteTextArea } from "polyfire-js/components";
import CodeDisplay from "./components/CodeDisplay";
import ImageGeneratedDemo from "./components/ImageGeneratedDemo";
import TextGeneratedDemo from "./components/TextGenerationDemo";
import TextSummaryDemo from "./components/TextSummaryDemo";
import TextTranslatedDemo from "./components/TextTranslatedDemo";

function App() {
    const {
        auth: { login, status },
    } = usePolyfire();

    return (
        <div className="bg-stone-900 text-stone-100">
            {status === "unauthenticated" ? (
                <div className="p-8 font-sans">
                    <h1 className="text-xl  font-bold mb-6">
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
                    <h1 className="text-2xl text-stone-100 font-bold mb-8">
                        🔥 Polyfire Components Demo
                    </h1>

                    {/* Auto Completion Test Section */}
                    <div className="bg-stone-800 p-6 rounded-lg shadow-md mb-10">
                        <h2 className="text-lg font-bold mb-5 border-b border-stone-600 pb-2">
                            Auto Completion Demo
                        </h2>

                        <h3 className="text-md font-semibold mb-4">AutoComplete Input</h3>
                        <AutoCompleteInput
                            placeholder="Type something here..."
                            containerClassName="mb-4"
                            className="bg-stone-700 text-stone-200 border !border-stone-600 placeholder-stone-200"
                        />
                        <CodeDisplay code={`<AutoCompleteInput />`} />

                        <hr className="my-6 border-t border-stone-600" />

                        <h3 className="text-md  font-semibold my-4">AutoComplete TextArea</h3>
                        <AutoCompleteTextArea
                            placeholder="Type something here..."
                            style={{
                                width: "100%",
                                marginBottom: "1rem",
                                backgroundColor: "rgb(68, 64, 60)",
                                borderColor: "rgb(87, 83, 78)",
                            }}
                            className="text-stone-200 placeholder-stone-200"
                            rows={5}
                        />
                        <CodeDisplay code={`<AutoCompleteTextArea />`} />
                    </div>

                    {/* Generation Test Section */}
                    <div className="bg-stone-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-lg  font-bold mb-5 border-b border-stone-600 pb-2">
                            Generation Demo
                        </h2>

                        {/* ImageGenerated */}
                        <ImageGeneratedDemo />
                        <hr className="my-6 border-t border-stone-600" />

                        {/* TextGenerated */}
                        <TextGeneratedDemo />
                        <hr className="my-6 border-t border-stone-600" />

                        {/* TextSummary */}
                        <TextSummaryDemo />
                        <hr className="my-6 border-t border-stone-600" />

                        {/* TextTranslated */}
                        <TextTranslatedDemo />
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-screen text-bold">
                    Initializing Components...
                </div>
            )}
        </div>
    );
}

export default App;
