import React, { useState } from "react";

const CodeDisplay = ({ code }: { code: string }) => {
    const [copyLabel, setCopyLabel] = useState("Copy");

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopyLabel("Copied!");
            setTimeout(() => setCopyLabel("Copy"), 1000);
        } catch (err) {
            setCopyLabel("Failed to copy!");
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <pre
                style={{
                    background: "#f4f4f4",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                }}
            >
                {code}
            </pre>
            <button
                onClick={copyToClipboard}
                style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    cursor: "pointer",
                    color: copyLabel === "Copied" ? "green" : "",
                }}
            >
                {copyLabel}
            </button>
        </div>
    );
};

export default CodeDisplay;
