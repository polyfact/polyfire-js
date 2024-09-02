---
title: "new Chat()"
slug: "new-chat"
excerpt: "This feature allows you to create a chatbot with the minimal amount of code"
hidden: false
createdAt: "Fri Nov 03 2023 02:48:16 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:43:07 GMT+0000 (Coordinated Universal Time)"
---
## Create a simple chatbot

To initialize a new chat:

```js javascript
// In React
const { utils: { Chat } } = usePolyfire();
// In other environments
const { utils: { Chat } } = polyfire;

const chat = new Chat();
```

## Chat context

You can add context to your chatbot by the `systemPrompt` parameter. Pass a string containing your context when initiating the chat object.

```js javascript
const systemPrompt = `Ask a random physics question. If the Human answers correctly, ask another question...`;
const chat = new Chat({ systemPrompt });
```

## Chat options

```ts typescript
type ChatOptions = {
  provider?: "openai" | "cohere" | "llama"; // The default value is "openai"
  systemPrompt?: string; // The system prompt as seen above
	systemPromptId?: string // The Id of a custom prompt
  autoMemory?: boolean;
};
```

### Provider

You can change the model provider using the provider option.

For example, to create a chatbot using cohere:

```js javascript
const chat = new Chat({ provider: "cohere" });
```

### AutoMemory

The autoMemory option allows to send every message of the chat to a new memory and use it in every message.

This adds a long-term memory to the chatbot.

```js javascript
const chat = new Chat();

await chat.sendMessage("The secret word is banana42");

... Send a lot of messages here

await chat.sendMessage("What is the secret word?"); // The chatbot should still answer with banana42
```

### systemPromptId

The systemPromptId option allows you to add the ID of a custom prompt that you've created using the[ prompt features](ref:prompt-store) or by directly using a prompt shared by another developer.

### systemPromptId

The `systemPromptId` option in the `ChatOptions` type allows you to specify a custom prompt that you've created for your app. This can be either the ID of the prompt or its alias. When using the Polyfire dashboard, the alias of the prompt is typically provided, which you can directly use here.

#### Usage Example

```typescript
import { Chat, usePolyfire } from 'polyfire-js';
import { ChatOptions } from "polyfire-js/generate";


// Example: Initializing a Chat with a custom system prompt ID (or alias)  
const App = () => {  
  // In React  
  const { utils: { Chat } } = usePolyfire();  
  // In other environments  
  // const { utils: { Chat } } = polyfire;

  // Assuming 'physics-quiz-alias' is the alias of the custom prompt that you have created.
  const customSystemPromptId = 'physics-quiz-alias';

  const chatOptions: ChatOptions = {  
    systemPromptId: customSystemPromptId  
  };

  const chat = new Chat(chatOptions);

  // Further chat implementation...  
};

export default App;
```
