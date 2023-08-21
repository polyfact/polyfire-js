import usePolyfact from "./usePolyfact";

type Message = {
    id: string | null;
    chat_id: string; // eslint-disable-line
    is_user_message: boolean; // eslint-disable-line
    content: string; // eslint-disable-line
    created_at: string | null; // eslint-disable-line
};

export default function useChat(): {
    messages?: Message[];
    sendMessage?: (message: string) => void;
    loading: boolean;
} {
    const { polyfact } = usePolyfact(null);

    const react = require("react"); // eslint-disable-line
    const [chat, setChat] = react.useState();
    const [history, setHistory] = react.useState([]);
    const [messages, setMessages] = react.useState([]);
    const [loading, setLoading] = react.useState(true);

    react.useEffect(() => {
        if (polyfact) {
            setChat(new polyfact.Chat());
            setHistory([]);
            setLoading(false);
        }
    }, [polyfact]);

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
        const stream = chat.sendMessageStream(message);

        stream.on("data", (d: string) => {
            aiMessage.content += d;
            setMessages([aiMessage, userMessage, ...history]);
        });

        stream.on("end", async () => {
            const history = await chat.getMessages();

            setHistory(history);
            setMessages(history);
            setLoading(false);
        });
    }

    if (polyfact) {
        return { messages, sendMessage, loading };
    }
    return { loading };
}
