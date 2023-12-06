import { useEffect } from "react";
import { usePolyfire } from "polyfire-js/hooks";
import { TextGenerated } from "polyfire-js/components";

function App() {
    const {
        auth: { login, status },
    } = usePolyfire();

    if (status === "unauthenticated") {
        return (
            <div>
                <h1>Don't forget to set a REACT_APP_PROJECT_ID environment variable</h1>
                <p>
                    After that you will be able to{" "}
                    <button
                        className="px-3 py-1 bg-black text-white"
                        onClick={() => login("github")}
                    >
                        Login With GitHub
                    </button>
                </p>
            </div>
        );
    }

    return (
        <>
            <h2 className="font-bold">Here's a little auto-generated haiku for you:</h2>
            <TextGenerated
                className="whitespace-pre font-mono p-3 rounded-lg text-left border-solid border border-gray-500 inline-block bg-gray-200"
                prompt="Generate a hello world haiku"
                loadingElement="loading..."
            />
        </>
    );
}

export default App;
