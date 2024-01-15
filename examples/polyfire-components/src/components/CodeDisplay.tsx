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
            <pre className="bg-stone-700 p-4 border border-stone-600 rounded text-sm font-mono overflow-x-auto">
                {code}
            </pre>
            <button
                onClick={copyToClipboard}
                className={`absolute top-2 right-2 flex items-center px-2 py-1 text-xs font-semibold rounded shadow-sm cursor-pointer ${
                    copyLabel === "Copied"
                        ? "bg-green-500 text-white"
                        : "bg-stone-800 hover:bg-stone-900"
                } focus:outline-none focus:ring-1 focus:ring-stone-500`}
                aria-label={copyLabel}
            >
                <FaCopy className="mr-1" />
                {copyLabel}
            </button>
            <span className="absolute bottom-full right-2 mb-2 hidden group-hover:block py-1 px-2 text-xs text-stone-100 bg-stone-700 rounded shadow-lg">
                Click to copy
            </span>
        </div>
    );
};

export default CodeDisplay;
