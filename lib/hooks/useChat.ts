import { useState, useEffect } from "react";
import usePolyfact from "./usePolyfact";
import type { Chat } from "../chats";

export type Message = {
    id: string | null;
    chat_id: string; // eslint-disable-line
    is_user_message: boolean; // eslint-disable-line
    content: string; // eslint-disable-line
    created_at: string | null; // eslint-disable-line
};

export default function useChat(): {
    messages: Message[];
    sendMessage: (message: string) => void;
    loading: boolean;
} {
    const {
        utils: { Chat },
    } = usePolyfact();

    const [chat] = useState<Chat>(new Chat());
    const [history, setHistory] = useState<Message[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    async function sendMessage(message: string) {
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
    }

    return { messages, sendMessage, loading };
}
