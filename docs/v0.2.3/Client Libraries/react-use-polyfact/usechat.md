---
title: "useChat"
slug: "usechat"
excerpt: ""
hidden: false
createdAt: "Tue Sep 12 2023 08:28:54 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Dec 29 2023 15:03:38 GMT+0000 (Coordinated Universal Time)"
---
## Importing the Hook

```js Javascript
import { useChat } from "polyfire-js/hooks";
```

## Using the useChat hook

```ts Typescript
function useChat(): ChatInstance
```

`useChat` doesn't take any parameter returns a `ChatInstance` object containing all the necessary informations and functions to interact with the chat as defined below:

```ts Typescript
type Message = {
    id: string | null; // The current question/answer will be null. An id will be set to it at the end of the generation
    chat_id: string;
    is_user_message: boolean;
    content: string;
    created_at: string | null; // The current question/answer will be null. The date will be set at the end of the generation
}

type ChatInfos = {
    created_at: string;
    id: string;
    latest_message_content: string;
    latest_message_created_at: string;
    name: string | null;
    system_prompt: string | null;
    system_prompt_id: string | null;
    user_id: string;
}

type ChatBase<T> = {
    data: T | undefined;
    error: string | undefined;
    loading: boolean;
}

type Chats = ChatBase<ChatInfos[]>
type ChatHistory = ChatBase<Message[]>
type ChatAnswer = ChatBase<Message>

type ChatUtils = {
    deleteChat: (chatId: string) => Promise<void>;
    renameChat: (chatId: string, name: string) => Promise<void>;
    resetChat: () => void;
    selectChat: (chatId: string) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
};

type ChatInstance = {
    answer: ChatAnswer;
    chat: ChatInfos | undefined;
    chats: Chats;
    history: ChatHistory;
    utils: ChatUtils;
}
```

To send a new message, use the `sendMessage` function.

```ts Typescript
function sendMessage(message: string): void;
```

The message will be added to messages and the answer from the LLM will be updated token by token until the answer have been fully generated.

During the generation, loading will be set to `true`, allowing you to disable the send button.

`answer.loading` is also set to true during the usePolyfire initialization.

> :warning: **Using sendMessage when answer.loading is true will throw an error**

## Example Usage

The [How to make a clone of ChatGPT](doc:chatgpt-clone) app could be simplified with this hook:

```js Javascript
function App() {
    const {
        auth: { login, status },
    } = usePolyfire();
    const {
        history: { data: messages },
        utils: { onSendMessage: sendMessage },
        answer: { loading },
    } = useChat();

    return (
        <>
            {status === "unauthenticated" ? (
                <div>
                    <h1 className="font-bold">
                        Don't forget to change the project slug in src/index.tsx
                    </h1>
                    <p>
                        After that you will be able to{" "}
                        <button
                            className="cursor-pointer bg-black text-white ml-1 p-1 px-5 font-mono-font-bold"
                            onClick={() => login("github")}
                        >
                            Login With GitHub
                        </button>
                    </p>
                </div>
            ) : status === "authenticated" ? (
                <ChatBox
                    messages={messages?.slice().reverse() || []}
                    onMessage={sendMessage}
                    loading={loading}
                />
            ) : (
                "Loading..."
            )}
        </>
    );
}
```
