---
title: "generate()"
slug: "generate-1"
excerpt: "This function is the simplest way to use LLM Text Generation."
hidden: false
createdAt: "Fri Nov 03 2023 02:45:48 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:43:07 GMT+0000 (Coordinated Universal Time)"
---
**Prototype:**

```ts typescript
// In React: const { models: { generate } } = usePolyfire();
// In other environments: const { models: { generate } } = polyfire;

async function generate(task: string, options?: GenerationOptions): Generation // Generation implements Promise<string>
```

## 💡 Examples

The simplest way to use it:

```js javascript
const answer = await polyfire.generate("Who was the first man to walk on the moon?");
```

You can also send some options as a second argument to the generate function.

```ts typescript
type GenerationOptions = {
  model?: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-32k" | "cohere" | "llama-2-70b-chat" | "replit-code-v1-3b" | "wizard-mega-13b-awq"; // The default value is gpt-3.5-turbo
  stop?: string[]; // A list of word where the generation should stop
  temperature?: number; // The text generation temperature (setting this to 0.0 will make the generation deterministic)
  memoryId?: string; // The id of a memory to improve the context given to the LLM see the memory section of the wiki to learn more.
  chatId?: string; // The id of a existing chat. It is not recommended to use this directly,prefer to use the chat feature, see the chat section to learn more.
  language?: string; // The language the result should be written in
}
```

For example, to generate with cohere:

```javascript
const answer = await polyfire.generate("What color is the sky?", { model: "gpt-4" });
```

## Generate Chains

You can easily construct chains of generates by call the generate method of the Generation result class

```javascript
const answer = await generate("Who was Neil Armstrong ?")
		.generate("Who was the US president at the time ?")
		.generate("Who was his wife ?");

console.log(answer);
// Answer: The wife of Richard Nixon, the President of the United States at the time of Neil Armstrong's moonwalk, was Pat Nixon.
```
