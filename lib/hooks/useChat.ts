/* eslint-disable camelcase */
import { useState, useEffect, useCallback } from "react";

import { generateUUIDV4 } from "../helpers/uuid";
import { PolyfireError } from "../helpers/error";
import type { Chat as ChatType, ChatInfos, ChatOptions } from "../chats";

import usePolyfire from "./usePolyfire";

export type Message = {
    chat_id: string;
    content: string;
    created_at: string | null;
    end_of_message?: boolean;
    id: string | null;
    is_user_message: boolean;
};

type ChatBase<T> = {
    data: T | undefined;
    error: string | undefined;
    loading: boolean;
};

export type Chats = ChatBase<ChatInfos[]>;
export type ChatHistory = ChatBase<Message[]>;
export type ChatAnswer = ChatBase<Message>;

export type ChatUtils = {
    deleteChat: (chatId: string) => Promise<void>;
    renameChat: (chatId: string, name: string) => Promise<void>;
    resetChat: () => void;
    selectChat: (chatId: string) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
};

export type ChatInstance = {
    answer: ChatAnswer;
    chat: ChatInfos | undefined;
    chats: Chats;
    history: ChatHistory;
    utils: ChatUtils;
};

export default function useChat(
    options?: Omit<ChatOptions, "chatId">,
    onError?: (error: string) => void,
    onSuccess?: (message: Message) => void,
): ChatInstance {
    const {
        auth: {
            status,
            user: { getToken },
        },
        utils: { Chat, getChatList, deleteChat, renameChat },
    } = usePolyfire();

    const [chatInstance, setChatInstance] = useState<ChatType>();
    const [chatId, setChatId] = useState<string>();
    // Chats list
    const [chatsData, setChatsData] = useState<ChatInfos[]>([]);
    const [chatsLoading, setChatsLoading] = useState<boolean>(false);
    const [chatsError, setChatsError] = useState<string | undefined>();

    // Chat
    const [chatData, setChatData] = useState<ChatInfos>();

    // Chat history
    const [history, setHistory] = useState<Message[]>([]);
    const [historyLoading, setHistoryLoading] = useState<boolean>(false);
    const [historyError, setHistoryError] = useState<string | undefined>();

    // Chat answer
    const [answer, setAnswer] = useState<Message>();
    const [answerError, setAnswerError] = useState<string | undefined>();
    const [answerLoading, setAnswerLoading] = useState<boolean>(false);

    const getChats = useCallback(async () => {
        setChatsLoading(true);
        getChatList(getToken)
            .then(setChatsData)
            .catch(setChatsError)
            .finally(() => {
                setChatsLoading(false);
            });
    }, []);

    const resetStates = useCallback(() => {
        setHistory([]);
        setHistoryError(undefined);
        setAnswer(undefined);
        setAnswerError(undefined);
        setChatInstance(undefined);
        setChatData(undefined);
        setChatId(undefined);
    }, []);

    const retrieveChat = useCallback(async (id: string) => {
        setHistoryLoading(true);
        const prevchatInstance = new Chat({
            ...options,
            chatId: id,
        } as ChatOptions);

        setChatInstance(prevchatInstance);
        setChatId(id);

        prevchatInstance
            .getMessages()
            .then((res) => {
                if (res?.length) setHistory(res.reverse());
                else setHistory([]);
            })
            .catch(setHistoryError)
            .finally(() => {
                setHistoryLoading(false);
            });
    }, []);

    const onSelectChat = useCallback(
        async (id: string) => {
            if (chatId === id) return;

            const chat = chatsData.find((c) => c.id === id);

            if (!chat) return;

            setChatData(chatsData.find((c) => c.id === id));
            retrieveChat(id);
        },
        [chatsData, chatId],
    );

    const onCreateChat = useCallback(
        async (message: string) =>
            // eslint-disable-next-line no-async-promise-executor
            new Promise<ChatType>(async (resolve) => {
                const newChatInstance = new Chat(options as ChatOptions);
                setChatInstance(newChatInstance);

                const newChatId = await newChatInstance.chatId;
                setChatId(newChatId);

                const newChatInfos = {
                    id: newChatId,
                    name: message,
                    system_prompt: newChatInstance?.options?.systemPrompt || null,
                    system_prompt_id: newChatInstance?.options?.systemPromptId || null,
                    created_at: new Date().toISOString(),
                    user_id: "",
                    latest_message_content: message,
                    latest_message_created_at: new Date().toISOString(),
                };

                setChatsData((prev) => [newChatInfos, ...prev]);

                await onSelectChat(newChatId);

                setHistory([]);
                setHistoryError(undefined);

                setAnswer(undefined);
                setAnswerError(undefined);

                resolve(newChatInstance);
            }),
        [],
    );

    const onRenameChat = useCallback(
        async (id: string, name: string): Promise<void> => {
            const chat = chatsData.find((c) => c.id === id);

            if (!chat) return;

            renameChat(id, name, getToken).then(() => {
                chat.name = name;
                setChatsData(chatsData);
            });
        },
        [chatsData],
    );

    const onDeleteChat = useCallback(
        async (id: string): Promise<void> =>
            deleteChat(id, getToken).then(() => {
                if (chatId === id) {
                    setChatId(undefined);
                    setHistory([]);
                    setChatInstance(undefined);
                }
                setChatsData(chatsData.filter((chat) => chat.id !== id));
            }),
        [chatsData, chatId],
    );

    const onSendMessage = useCallback(
        async (message: string): Promise<void> => {
            try {
                if (answerLoading) return;

                setAnswerLoading(true);
                setAnswerError(undefined);

                let newChatInstance = chatInstance;
                if (!chatInstance) {
                    newChatInstance = await onCreateChat(message);
                }

                if (!newChatInstance) {
                    throw new PolyfireError(
                        "sendMessage: You need to be authenticated to use this function",
                    );
                }

                const userMessage: Message = {
                    id: generateUUIDV4(),
                    chat_id: await newChatInstance.chatId,
                    is_user_message: true,
                    content: message,
                    created_at: new Date().getTime().toString(),
                    end_of_message: true,
                };
                const aiMessage: Message = {
                    id: generateUUIDV4(),
                    chat_id: await newChatInstance.chatId,
                    is_user_message: false,
                    content: "",
                    created_at: null,
                    end_of_message: false,
                };

                setHistory((prev) => [...prev, userMessage]);
                setAnswerError(undefined);

                setAnswerLoading(true);

                const stream = newChatInstance.sendMessage(message);

                stream.on("data", (chunk: string) => {
                    aiMessage.content += chunk;

                    setAnswer({ ...aiMessage });
                    setAnswerLoading(false);
                });

                stream.on("error", (error: string) => {
                    setAnswerError(error);
                    onError?.(error);

                    stream.stop();
                });

                stream.on("end", async () => {
                    aiMessage.created_at = new Date().getTime().toString();
                    aiMessage.end_of_message = true;

                    setHistory((prev) => [...prev, aiMessage]);
                    setAnswer(undefined);

                    onSuccess?.(aiMessage);
                });
            } catch (error) {
                if (error instanceof Error) {
                    setAnswerError(error.message);
                    onError?.(error.message);
                }
            }
        },
        [chatInstance, answerLoading],
    );

    useEffect(() => {
        if (status === "authenticated") getChats();
    }, [status]);

    const onResetChat = useCallback(() => {
        resetStates();
    }, []);

    return {
        chats: {
            loading: chatsLoading,
            error: chatsError,
            data: chatsData,
        },
        chat: chatData,
        history: {
            loading: historyLoading,
            error: historyError,
            data: history,
        },
        answer: {
            loading: answerLoading,
            error: answerError,
            data: answer,
        },
        utils: {
            sendMessage: onSendMessage,
            deleteChat: onDeleteChat,
            selectChat: onSelectChat,
            renameChat: onRenameChat,
            resetChat: onResetChat,
        },
    };
}
