import React from "react";
import { usePolyfire, useChat } from "polyfire-js/hooks";
import ChatBox from "./ChatBox";

function App() {
    const {
        auth: { login, status },
    } = usePolyfire();
    const { messages, sendMessage, loading } = useChat();

    return (
        <>
            {status === "unauthenticated" ? (
                <div>
                    <h1 className="font-bold">
                        Don't forget to change the project slug in src/index.tsx
                    </h1>
                    <p>
                        After that you will be able to{" "}
                        <button
                            className="cursor-pointer bg-black text-white ml-1 p-1 px-5 font-mono-font-bold"
                            onClick={() => login("github")}
                        >
                            Login With GitHub
                        </button>
                    </p>
                </div>
            ) : status === "authenticated" ? (
                <ChatBox
                    messages={messages?.slice().reverse() || []}
                    onMessage={sendMessage}
                    loading={loading}
                />
            ) : (
                "Loading..."
            )}
        </>
    );
}

export default App;
