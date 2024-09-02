---
title: "stream"
slug: "stream"
excerpt: ""
hidden: false
createdAt: "Mon Sep 11 2023 14:53:10 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:44:07 GMT+0000 (Coordinated Universal Time)"
---
The result of a generation can also be used as a stream

**Prototype:**

```ts typescript
function generate(
    task: string,
    options: GenerationOption,
): Generation; // Generation implements the Readable interface from https://www.npmjs.com/package/readable-stream
```

The stream should send the result token by token instead of waiting for the whole answer.

_NOTE: Cohere doesn't support streams yet and will return the entire answer in one chunk_

### 💡 Example

The result can be piped to a writable stream with the `pipe` method or individuals chunks can be retrieved using the `.on` method as seen in the [stream api](https://nodejs.org/api/stream.html#readable-streams)

```js javascript
const resultStream = polyfire.generate("Who was the first man to walk on the moon?", { stream: true });

resultStream.on("data", console.log); // In this should start printing the result word by word
```
