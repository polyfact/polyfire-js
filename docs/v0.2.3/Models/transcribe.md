---
title: "Speech to text"
slug: "transcribe"
excerpt: "Transcribe audio files to texts easily using the transcribe function"
hidden: false
createdAt: "Mon Sep 11 2023 08:56:11 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:44:07 GMT+0000 (Coordinated Universal Time)"
---
## Function: transcribe

**Prototype:**

```ts typescript
async function transcribe(file: Uint8Array | Buffer | Readable): Promise<string>
```

### 💡 Example

```js javascript
// Get your file from an upload/fetch.

// In React:
const { models: { transcribe } } = usePolyfire();
// In other environments:
const { models: { transcribe } } = polyfire;

const transcription = await transcribe(file);

console.log(transcription);
```

Should return (only if you have send the audio version on the bee-movie of course)

```
According to all known laws of aviation, there is no way that a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care about what humans think is impossible.
```

The supported file formats are `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav` and `webm`

The maximum file size is 25MB
