---
title: "Chat Examples"
slug: "other-chat-overvire"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Wed Sep 27 2023 06:10:11 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Nov 03 2023 01:18:53 GMT+0000 (Coordinated Universal Time)"
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

To send your first message to the chatbot:

```js javascript
const first = await chat.sendMessage("Who was the first man to walk on the moon?");

console.log(first); // Neil Armstrong.
```

Your chatbot will return the answer and remember the previous messages.

```js javascript
const second = await chat.sendMessage("Who was the second one?");

console.log(second); // Buzz Aldrin.

const president = await chat.sendMessage("Who was the US President at the time?");

console.log(second); // Richard Nixon.

const firstNames = await chat.sendMessage("What were the first names of these three?");

console.log(firstNames); // Neil, Buzz and Richard.
```

## Streams

As for the [stream with generate](ref:stream) function, you can choose to get streams instead of promises by adding `stream`  option to `sendMessage` method.

```js javascript
const resultStream = chat.sendMessage("Who was the first man to walk on the moon?", {stream: true})

resultStream.on("data", (d) => console.log(d)); // The answer should start to be printed on the console word by word

await new Promise((res) => stream.on("end", resultStream)); // This is just to wait the end of the stream, this is not required
```

## Chat context

You can add context to your chatbot by the `systemPrompt` parameter. Pass a string containing your context when initiating the chat object.

```js javascript
const systemPrompt = `Ask a random physics question. If the Human answers correctly, ask another question...`;
const chat = new Chat({ systemPrompt });
```

## Get the message history

You can use the `getMessages` method to get the previous messages

It will return an array of Messages sorted from the most recent ones to the oldest:

```ts typescript
type Message = {
  id: string; // A unique id for the message
  chat_id: string; // A unique id for the chat
  is_user_message: boolean; // Whether the message was send by the user or the chatbot.
  content: string; // The content of the message
  created_at: string; // An ISO date for the time when the message was sent
}
```

For example, after having run our example above:

```js javascript
const history = await chat.getMessages();

const lastAnswer = history[0];

console.log(lastAnswer.content); // Neil, Buzz and Richard.
```

## Chat options

```ts typescript
type ChatOptions = {
  provider?: "openai" | "cohere" | "llama"; // The default value is "openai"
  systemPrompt?: string; // The system prompt as seen above
	systemPromptId? string // The Id of a custom prompt
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
const chat = new Chat({ autoMemory: true });

await chat.sendMessage("The secret word is banana42");

... Send a lot of messages here

await chat.sendMessage("What is the secret word?"); // The chatbot should still answer with banana42
```

### systemPromptId

The systemPromptId option allows you to add the ID of a custom prompt that you've created using the[ prompt features](ref:prompt-store) or by directly using a prompt shared by another developer.
