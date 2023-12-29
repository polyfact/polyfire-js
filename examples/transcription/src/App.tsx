import React, { useState } from "react";
import { usePolyfire } from "polyfire-js/hooks";

function App() {
    const { auth, models } = usePolyfire();
    const [transcription, setTranscription] = useState("");
    const [transcriptionLoading, setTranscriptionLoading] = useState(false);

    const { login, status } = auth;
    const { transcribe } = models;

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];

        const buffer = new Uint8Array(file.size);
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            const arrayBuffer = fileReader.result as ArrayBuffer;
            const array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < array.length; i++) {
                buffer[i] = array[i];
            }
            setTranscriptionLoading(true);
            transcribe(buffer)
                .words()
                .then((words) => {
                    console.log(words);
                    setTranscription(
                        words.map((word) => `${word.word}(${word.speaker})`).join("|"),
                    );
                    setTranscriptionLoading(false);
                });
        };
        fileReader.readAsArrayBuffer(file);
    };

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
    } else if (status === "loading" || transcriptionLoading) {
        return <div>Loading...</div>;
    } else if (status === "authenticated") {
        return (
            <div>
                {transcription && <p>{transcription}</p>}
                <input
                    type="file"
                    id="audio"
                    name="audio"
                    accept="audio/mp3"
                    onChange={handleFileChange}
                />
            </div>
        );
    } else {
        return <div />;
    }
}

export default App;
