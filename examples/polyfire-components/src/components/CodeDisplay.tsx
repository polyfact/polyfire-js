import { useState } from "react";
import { FaCopy } from "react-icons/fa";

const CodeDisplay = ({ code }: { code: string }) => {
    const [copyLabel, setCopyLabel] = useState("Copy");

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopyLabel("Copied!");
            setTimeout(() => setCopyLabel("Copy"), 2000);
        } catch (err) {
            setCopyLabel("Failed to copy!");
        }
    };

    return (
        <div className="relative group">
            <pre className="bg-gray-200 p-4 border border-gray-300 rounded text-sm font-mono overflow-x-auto">
                {code}
            </pre>
            <button
                onClick={copyToClipboard}
                className={`absolute top-2 right-2 flex items-center px-2 py-1 text-xs font-semibold rounded shadow-sm cursor-pointer ${
                    copyLabel === "Copied"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-800 hover:bg-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label={copyLabel}
            >
                <FaCopy className="mr-1" />
                {copyLabel}
            </button>
            <span className="absolute bottom-full right-2 mb-2 hidden group-hover:block py-1 px-2 text-xs text-white bg-black rounded shadow-lg">
                Click to copy
            </span>
        </div>
    );
};

export default CodeDisplay;
