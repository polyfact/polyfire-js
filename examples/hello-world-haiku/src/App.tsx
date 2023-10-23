import React, { useState, useEffect } from "react";
import { usePolyfire } from "polyfire-js/hooks";

function App() {
    const { auth, models } = usePolyfire();
    const [helloWorld, setHelloWorld] = useState<string>();

    const { login, status } = auth;
    const { generate } = models;

    useEffect(() => {
        if (status === "authenticated") {
            generate("Write a hello world haiku").then(setHelloWorld);
        }
    }, [status, generate]);

    if (status === "unauthenticated") {
        return (
            <div>
                <h1>Don't forget to change the project slug in src/index.tsx</h1>
                <p>
                    After that you will be able to{" "}
                    <button onClick={() => login("github")}>Login With GitHub</button>
                </p>
            </div>
        );
    } else if (status === "loading" || !helloWorld) return <div>Loading...</div>;
    else if (status === "authenticated") return <div>{helloWorld}</div>;
    else return <div />;
}

export default App;
