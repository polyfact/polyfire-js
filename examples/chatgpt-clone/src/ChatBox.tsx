import React, { FormEvent } from "react";

function ChatBox({
    messages,
    onMessage,
    loading,
}: {
    messages: { is_user_message: boolean; content: string }[];
    onMessage: (message: string) => Promise<void> | void;
    loading: boolean;
}) {
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const message = (e.target as any).message.value;
        if (message) {
            (e.target as any).message.value = "";
            await onMessage(message);
        }
    }

    return (
        <div className="flex flex-col items-center h-full py-2">
            <div className="border-black border border-solid p-4 mb-2 w-[800px] grow overflow-y-scroll">
                <pre>
                    {messages.map((elem) => (
                        <p className="whitespace-pre-wrap" key={elem.content}>
                            <b>{elem.is_user_message ? "Human:" : "AI:"}</b> {elem.content}
                        </p>
                    ))}
                </pre>
            </div>
            <form onSubmit={handleSubmit} className="flex w-[800px]">
                <div className="flex grow items-center border-black border border-solid">
                    <div className="font-bold ml-4">Human:</div>
                    <input
                        className="p-1 my-2 mx-4 h-12 font-mono grow"
                        placeholder="Type your message here !"
                        name="message"
                    />
                </div>
                <input
                    className="cursor-pointer bg-black text-white ml-2 p-2 px-5 font-mono font-bold"
                    value={loading ? "Loading..." : "Send >"}
                    type="submit"
                    disabled={loading}
                />
            </form>
        </div>
    );
}

export default ChatBox;
