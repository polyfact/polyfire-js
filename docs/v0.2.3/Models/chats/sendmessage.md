---
title: "sendMessage"
slug: "sendmessage"
excerpt: ""
hidden: false
createdAt: "Wed Sep 27 2023 06:08:16 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:43:07 GMT+0000 (Coordinated Universal Time)"
---
The `sendMessage` method in the `Chat` class is used to send a message to a chat conversation. This method automatically adapts to provide either a stream of responses or a single, complete response based on how it is called.

### Key Features

#### Context-Aware

- **Conversational Memory**: Every message sent and the corresponding response from the language model are stored, ensuring a continuous and coherent conversation flow by keeping track of all previous exchanges.

#### Flexible Response Handling

- **Streaming Mode**: Direct calls to `sendMessage` return a stream for real-time, incremental responses. Useful for lengthy or real-time interactions. Requires event listeners like `on('data', callback)`.
- **Complete Mode**: Using `sendMessage` with `async/await` or `.then` returns a promise for a single, full response, suitable for standard request-response scenarios.

### Usage Examples

#### Non-Streaming Response

To receive a complete response after the message processing is finished, use `sendMessage` with `async/await` or `.then`. This will return a promise that resolves to a string containing the full response.

```ts
const chat = new Chat();

// Example using async/await
async function getCompleteResponse() {
  const answerString = await chat.sendMessage("Who was the first man to walk on the moon?");
  console.log("Non-Streaming Response:", answerString);
}

// Example using .then
chat.sendMessage("Who was the first man to walk on the moon?")
  .then(answerString => {
    console.log("Non-Streaming Response:", answerString);
  });
```

#### Streaming Response

For a real-time, incremental response, simply call `sendMessage` without `async/await` or `.then`. This will return a stream of responses as they become available.

```ts
const chat = new Chat();

// Sending a message for streaming response
const responseStream = chat.sendMessage("Who was the first man to walk on the moon?");

responseStream.on('data', (data) => {
  console.log("Streaming Part of Response:", data);
});
```
