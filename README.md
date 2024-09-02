<h1 align="center">🔥 polyfire</h1>

<h4 align="center">
    <a href="https://www.polyfire.com/discord">Discord</a> |  <a href="https://beta.polyfire.com">Dashboard</a>
</h4>

<p align="center">⚡ An all-in-one managed backend for AI apps. Build AI apps from the frontend, very fast. 🪶</p>

Why use Polyfire?

-   Just code from the frontend, no backend needed
-   If you already have backend, less code to write
-   Most backend services you'd need in a couple lines of code

We **manage your AI backend** so you don't have to.

![Demo Gif](https://files.readme.io/7442014-demo.gif)

> **Note:** The Polyfire SDK and API are no longer actively maintained, but you can still use them. For more information, please refer to the documentation in the `docs` folder.

### React

```js
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { TextGenerated, Login } from "polyfire-js/components";

function App() {
    return (
        <Login>
            <h2>Here's a little auto-generated haiku for you:</h2>
            <TextGenerated prompt="Generate a hello world haiku" />
        </Login>
    );
}

document.body.innerHTML = '<div id="app"></div>';
const root = createRoot(document.getElementById("app"));
root.render(
    <PolyfireProvider project="your_project_id">
        <App />
    </PolyfireProvider>,
);
```

> Don't forget to change the **your_project_id** by your project ID you will have got on https://beta.polyfire.com

### Vanilla JS

```html
<script src="https://github.com/polyfire-ai/polyfire-js/releases/download/0.2.7/polyfire-min-0.2.7.js"></script>
<script>
    (async () => {
        const polyfire = window.PolyfireClientBuilder({ project: "your_project_id" });

        const isAuthenticated = await polyfire.auth.init();
        if (!isAuthenticated) {
            await polyfire.auth.login("github");
        }

        const helloWorld = await polyfire.models.generate("Write me a hello world haiku");
        console.log(helloWorld);
    })();
</script>
```

> Don't forget to change the **your_project_id** by your project ID you will have got on https://beta.polyfire.com

## 🔗 Links

-   Website: [polyfire.com](https://www.polyfire.com)
-   Dashboard: [beta.polyfire.com](https://beta.polyfire.com)
-   Discord: [polyfire.com/discord](https://www.polyfire.com/discord)
-   Javascript SDK: [github.com/polyfact/polyfire-js](https://www.github.com/polyfact/polyfire-js)
-   Open Source API (your managed backend!): [github.com/polyfact/polyfire-api](https://github.com/polyfact/polyfire-api)

We're open source! Make a good PR to the JS SDK or the API and we'll merge it.


# SDK Documentation

## Overview

This SDK provides functionalities for text generation, transcription, memory management, image generation, and data loading. Below is a guide on how to use these features.

### Installation

To install the SDK, use the following command:

```bash
npm install polyfire-js
```

### Importing the SDK

To use the SDK, import the necessary functions and classes:

```typescript
import {
    generate,
    generateWithType,
    transcribe,
    Chat,
    createMemory,
    updateMemory,
    getAllMemories,
    generateImage,
    TextFileLoader,
    StringLoader,
    AudioLoader,
    kv,
    usage,
    t
} from "polyfire-js";
import PolyfireClientBuilder from "polyfire-js";
```

## Features

### Text Generation

- **generate**: Generate text based on input.
- **generateWithType**: Generate text with probabilistic types.

```typescript
const options: GenerationOptions = { /* Generation options */ };
const result = await generate("Your input text", options);
```

### Transcription

- **transcribe**: Transcribe audio to text.

```typescript
const transcription = await transcribe(audioFile);
```

### Chat

- **Chat**: Class for handling chat functionalities.

```typescript
const chat = new Chat();
chat.sendMessage("Hello!");
```

### Memory Management

- **createMemory**: Create embeddings for memory.
- **updateMemory**: Update existing embeddings.
- **getAllMemories**: Retrieve all embeddings.

```typescript
const memory = createMemory(data);
const updatedMemory = updateMemory(memoryId, newData);
const allMemories = getAllMemories();
```

### Image Generation

- **generateImage**: Generate images based on input.

```typescript
const image = await generateImage("A beautiful sunset");
```

### Data Loaders

- **TextFileLoader**: Load text files.
- **StringLoader**: Load strings.
- **AudioLoader**: Load audio files.

```typescript
const textLoader = new TextFileLoader(filePath);
const stringLoader = new StringLoader(stringData);
const audioLoader = new AudioLoader(audioFile);
```

### Key-Value Store Operations

- **kv.get**: Retrieve a value by key.
- **kv.set**: Store a value by key.
- **kv.del**: Delete a value by key.
- **kv.all**: Retrieve all key-value pairs.

```typescript
const value = await kv.get("key");
await kv.set("key", "value");
await kv.del("key");
const allValues = await kv.all();
```

### Usage Tracking

- **usage**: Track usage of the SDK.

```typescript
const usageData = await usage();
```

### Type Validation

- **t**: Type validation using `polyfact-io-ts`.

```typescript
const isValid = t.validate(data, schema);
```

### Client Builder

- **PolyfireClientBuilder**: Build the client.

```typescript
const client = new PolyfireClientBuilder({ apiKey: "your-api-key" });
```

## Example Usage

Here is a complete example of using the SDK:

```typescript
import {
    generate,
    transcribe,
    createMemory,
    generateImage,
    kv,
    usage
} from "polyfire-js";
import PolyfireClientBuilder from "polyfire-js";

async function main() {
    // Text generation
    const text = await generate("Hello, world!");

    // Transcription
    const transcription = await transcribe("path/to/audio/file");

    // Memory management
    const memory = createMemory("Some data");

    // Image generation
    const image = await generateImage("A beautiful sunset");

    // Key-Value operations
    await kv.set("key", "value");
    const value = await kv.get("key");

    // Usage tracking
    const usageData = await usage();

    // Client builder
    const client = new PolyfireClientBuilder({ apiKey: "your-api-key" });
}

main();
```

