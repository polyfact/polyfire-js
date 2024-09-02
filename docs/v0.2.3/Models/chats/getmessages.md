---
title: "getMessages"
slug: "getmessages"
excerpt: ""
hidden: false
createdAt: "Wed Sep 27 2023 06:31:52 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:44:07 GMT+0000 (Coordinated Universal Time)"
---
Get the history of the previous chat messages.

- Returns an array of Messages sorted from the most recent ones to the oldest.

```js javascript
const history = await chat.getMessages();

const lastAnswer = history[0];

console.log(lastAnswer.content); // Neil, Buzz and Richard.
```

```ts typescript
type Message = {
  id: string; // A unique id for the message
  chat_id: string; // A unique id for the chat
  is_user_message: boolean; // Whether the message was sent by the user or the chatbot.
  content: string; // The content of the message
  created_at: string; // An ISO date for the time when the message was sent
}
```
