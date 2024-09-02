---
title: "useChatContext"
slug: "usechatcontext"
excerpt: ""
hidden: true
createdAt: "Fri Jan 12 2024 13:24:48 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
## `useChatContext` Hook

The useChatContext hook provides a comprehensive set of values that you can use to manage and display chat functionalities. It is particularly useful for creating your own custom components to integrate into the chat, as it offers essential data and functions needed for dynamic chat interactions and management. 

Importantly, this hook must be used within the Chat.Root component, as it relies on the context provided by Chat.Root to function correctly.

```typescript
{
  answer: {
    data: Message
    error: string | undefined
    loading: boolean
  }
  chat: {
    ref: HTMLDivElement
    isAtBottom: boolean
  } & ChatInfos
  chats: {
    data: ChatInfos[] | undefined
    error: string | undefined
    loading: boolean
  }
  history: {
    data: Message[]
    error: string | undefined
    loading: boolean
  }
  utils: {
    deleteChat: (chatId: string) => Promise<void>
    renameChat: (chatId: string, name: string) => Promise<void>
    resetChat: () => void
    selectChat: (chatId: string) => Promise<void>
    sendMessage: (message: string) => Promise<void>
    scrollToBottom: (behavior?: ScrollBehavior) => void
  }
  prompt: {
    value: string
    onChange: (value: string) => void
  }
}
```

### 1. `chats`

```typescript
type Chats = {
    data: ChatInfos[] | undefined;
    error: string | undefined;
    loading: boolean;
};
```

- **Description**: Contains information about all chats.
- **Properties**:
  - `loading`: Indicates if the chat list is currently loading.
  - `error`: Error message, if any, while fetching chats.
  - `data`: Array of `ChatInfos` objects representing individual chats.

### 2. `chat`

```typescript
type Chat = {
  ref:HTMLDivElement;
  isAtBottom: boolean;
} & ChatInfos;
```

- **Description**: Information about the currently selected chat.
- **Properties**:
  - `ref`: A reference to the chat container DOM element, useful for scroll management and other direct manipulations.
  - `isAtBottom`: A boolean value indicating whether the chat is currently scrolled to its bottommost point.
  - `created_at`: The creation timestamp of the chat session.
  - `id`: A unique identifier for the chat session.
  - `latest_message_content`: The content of the most recent message in the chat.
  - `latest_message_created_at`: The timestamp of the most recent message sent in the chat.
  - `name`: The name of the chat session, which can be `null` if not set.
  - `system_prompt`: The initial system prompt or message for the chat session, can be `null`.
  - `system_prompt_id`: A unique identifier for the system prompt, can be `null`.
  - `user_id`: The identifier of the user involved in the chat session.

### 3. `history`

```typescript
type ChatHistory = {
    data: Message[];
    error: string | undefined;
    loading: boolean;
};
```

- **Description**: Contains the history of messages in the current chat.
- **Properties**:
  - `loading`: Indicates if the chat history is loading.
  - `error`: Error message, if any, while fetching chat history.
  - `data`: Array of `Message` objects representing individual messages.

### 4. `answer`

```typescript
type ChatAnswer = = {
    data: Message;
    error: string | undefined;
    loading: boolean;
};
```

- **Description**: Information about the latest response or message in the chat.
- **Properties**:
  - `loading`: Indicates if the latest response is loading.
  - `error`: Error message, if any, related to the latest response.
  - `data`: A `Message` object representing the latest message.

### 5. `utils`

```typescript
type ChatUtils = {
    deleteChat: (chatId: string) => Promise<void>;
    renameChat: (chatId: string, name: string) => Promise<void>;
    resetChat: () => void;
    selectChat: (chatId: string) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
};
```

- **Description**: Utility functions for managing chats.
- **Functions**:
  - `sendMessage(message: string)`: Send a message.
  - `deleteChat(chatId: string)`: Delete a chat.
  - `selectChat(chatId: string)`: Select a specific chat.
  - `renameChat(chatId: string, name: string)`: Rename a chat.
  - `resetChat()`: Reset the current chat.
  - `scrollToBottom(behavior: ScrollBehavior)`: Scroll the chat to the bottom.

### 6. `prompt`

```typescript
type Prompt = { 
  value: string;
  onChange: (value: string) => void; 
}
```

- **Description**: Manages the current input value in the chat prompt.
- **Properties**:
  - `value`: The current input value.
  - `onChange`: Function to update the input value.

## Example: Custom Chat Message Component

```jsx
import React from 'react';
import { useChatContext } from '@polyfact-ai/chat-ui';

const CustomChatMessage = () => {
  const { history } = useChatContext();

  // Render each message in chat history
  return (
    <div className="chat-messages">
      {history.data.map((message, index) => (
        <div key={index} className={`message ${message.is_user_message ? 'user-message' : 'bot-message'}`}>
          <div className="message-content">
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomChatMessage;

```

## Complementary Chat types

### `ChatInfos`

```typescript
type ChatInfos = {
    created_at: string;
    id: string;
    latest_message_content: string;
    latest_message_created_at: string;
    name: string | null;
    system_prompt: string | null;
    system_prompt_id: string | null;
    user_id: string;
};
```

### `Message`

```typescript
type Message = {
    chat_id: string;
    content: string;
    created_at: string | null;
    end_of_message?: boolean;
    id: string | null;
    is_user_message: boolean;
};
```
