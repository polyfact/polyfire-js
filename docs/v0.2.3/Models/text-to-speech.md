---
title: "Text to speech"
slug: "text-to-speech"
excerpt: "Generate realistic audio files from written text"
hidden: false
createdAt: "Thu Oct 26 2023 13:08:03 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Thu Oct 26 2023 13:35:00 GMT+0000 (Coordinated Universal Time)"
---
## Function: tts

**Prototype:**

```ts typescript
async function tts(text: string, options?: TTSOptions): Promise<AudioTTS>

type TTSOptions = { voice?: string }; // See below the list of all possible voices

function AudioTTS.getMp3Buffer(): Buffer // Get the speech as an Mp3 file buffer
async function AudioTTS.getAudioBuffer(): Promise<AudioBuffer> // Get the speech as a standard [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)
async function AudioTTS.play(): Promise<void> // Play the speech audio
```

### 💡 Example

```js javascript
// In React:
const { models: { tts } } = usePolyfire();
// In other environments:
const { models: { tts } } = polyfire;

const audio = await tts("According to all known laws of aviations, there is no way that a bee should be able to fly.");

await audio.play();
```

***

## Available voices list:

| name      | gender | description    | provider   |
| :-------- | :----- | :------------- | :--------- |
| rachel    | female | calm           | elevenlabs |
| clyde     | male   | war veteran    | elevenlabs |
| domi      | female | strong         | elevenlabs |
| dave      | male   | conversational | elevenlabs |
| fin       | male   | sailor         | elevenlabs |
| bella     | female | soft           | elevenlabs |
| antoni    | male   | well-rounded   | elevenlabs |
| thomas    | male   | calm           | elevenlabs |
| charlie   | male   | casual         | elevenlabs |
| emily     | female | calm           | elevenlabs |
| elli      | female | emotional      | elevenlabs |
| callum    | male   | hoarse         | elevenlabs |
| patrick   | male   | shouty         | elevenlabs |
| harry     | male   | anxious        | elevenlabs |
| liam      | male   |                | elevenlabs |
| dorothy   | female | pleasant       | elevenlabs |
| josh      | male   | deep           | elevenlabs |
| arnold    | male   | crisp          | elevenlabs |
| charlotte | female | seductive      | elevenlabs |
| matilda   | female | warm           | elevenlabs |
| matthew   | male   |                | elevenlabs |
| james     | male   | calm           | elevenlabs |
| joseph    | male   |                | elevenlabs |
| jeremy    | male   | excited        | elevenlabs |
| michael   | male   |                | elevenlabs |
| ethan     | male   |                | elevenlabs |
| gigi      | female | childlish      | elevenlabs |
| freya     | female |                | elevenlabs |
| grace     | female |                | elevenlabs |
| daniel    | male   | deep           | elevenlabs |
| serena    | female | pleasant       | elevenlabs |
| adam      | male   | deep           | elevenlabs |
| nicole    | female | whisper        | elevenlabs |
| jessie    | male   | raspy          | elevenlabs |
| ryan      | male   | soldier        | elevenlabs |
| sam       | male   | raspy          | elevenlabs |
| glinda    | female | witch          | elevenlabs |
| giovanni  | male   | foreigner      | elevenlabs |
| mimi      | female | childish       | elevenlabs |
