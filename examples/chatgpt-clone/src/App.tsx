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
                <button onClick={() => login("github")}>Login with Github</button>
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
