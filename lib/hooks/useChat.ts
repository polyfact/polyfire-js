import { useState, useEffect } from "react";
import usePolyfire from "./usePolyfire";
import type { Chat } from "../chats";

declare const window: Window;

export type Message = {
    id: string | null;
    chat_id: string; // eslint-disable-line camelcase
    is_user_message: boolean; // eslint-disable-line camelcase
    content: string; // eslint-disable-line camelcase
    created_at: string | null; // eslint-disable-line camelcase
};

export default function useChat(): {
    messages: Message[];
    sendMessage: (message: string) => void;
    loading: boolean;
} {
    const {
        auth: { status },
        utils: { Chat },
    } = usePolyfire();

    const [chat, setChat] = useState<Chat>();
    const [history, setHistory] = useState<Message[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            setChat(new Chat());
        }
    }, [status]);

    async function sendMessage(message: string) {
        if (!chat) {
            throw new Error("sendMessage: You need to be authenticated to use this function");
        }

        const userMessage = {
            id: null,
            chat_id: await chat.chatId,
            is_user_message: true,
            content: message,
            created_at: null,
        };
        const aiMessage = {
            id: null,
            chat_id: await chat.chatId,
            is_user_message: false,
            content: "",
            created_at: null,
        };
        setLoading(true);

        setMessages([userMessage, ...history]);
        const stream = chat.sendMessage(message);

        stream.on("data", (d: string) => {
            aiMessage.content += d;
            setMessages([aiMessage, userMessage, ...history]);
        });

        stream.on("error", (d: string) => {
            console.error(d);
            throw new Error(d);
        });

        stream.on("end", async () => {
            const history = await chat.getMessages();

            setHistory(history);
            setMessages(history);
            setLoading(false);
        });

        if (window) {
            window.addEventListener("beforeunload", () => {
                stream.stop();
            });
        }
    }

    return { messages, sendMessage, loading };
}
