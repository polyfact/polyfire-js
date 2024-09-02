---
title: "DataLoaders"
slug: "dataloaders"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Sep 12 2023 08:33:18 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Mon Nov 06 2023 10:35:43 GMT+0000 (Coordinated Universal Time)"
---
Data Loaders are designed to make it easy to send context to a LLM. 

The Data Loaders are built on top of memories, this means the Key Points of the [Embeddings](ref:embeddings) feature also applies to it. _TLDR; it's not made for summarizing documents, it's best use is for search._

## Using dataloaders

You can send your dataloaders in the `data` field of the generationOption.

For example, here's how you would use the `AudioLoader` dataloader:

```js Javascript
import { AudioLoader } from "polyfire-js";

// In React:
const { models: { generate } } = usePolyfire();
// In other environments:
const { models: { generate } } = polyfire;

const audioStream = await fetch("https://storage.googleapis.com/polyfact-docs-storage/secret.mp3");

if (audioStream?.body) {
  const answer = await generate("What is the secret ?", {
    data: AudioLoader(audioStream.body),
  });

  console.log(answer); // It should give you something like "The secret is banana42"
}
```

We already expose 3 simple dataloaders `AudioLoader`, `TextFileLoader` and `StringLoader`:

```ts Typescript
// TextFileLoader is used to load content from a raw text file (Buffer or Stream)
function TextFileLoader(file: FileInput, maxTokenPerChunk = 100): Loader;

// AudioLoader is used to load content from an audio file (Buffer or Stream, the formats are the ones supported by transcribe)
function AudioLoader(file: FileInput, maxTokenPerChunk = 100): Loader;

// StringLoader is used to load content directly from a string
function StringLoader(str: string, maxTokenPerChunk = 100): Loader;
```

## Implementing a new dataloader

Under the hood, a dataloader is a function that takes a embedding collection and loads some data to it.

The dataloader must be of the type LoaderFunction.

```ts Typescript
type LoaderFunction = (embeddings: Embeddings, clientOptions: InputClientOptions) => Promise<void>;
```

But we in most cases we can use the StringLoader to implement your own dataLoader without having to manage the Embeddings and chunking of the data ourselves.

For example, let's imagine we want to implement a dataloader that just takes an URL and load the raw html content of the page to the context:

```js Typescript
function URLLoader(url: string, maxTokenPerChunk = 100): LoaderFunction {
  return async function loadURLContentIntoMemory(...args) {
    const response = await fetch(url);
    const content = await response.text();

    await StringLoader(content, maxTokenPerChunk)(...args);
  };
}
```

We can now use our URLLoader by sending it to the generate function:

```js Javascript
const answer = await generate("your_question", {
  data: URLLoader("your_url_with_infos_about_your_subject")
});
```

> **NOTE:**
>
> This naive implementation of URLLoader might not be optimal, especially on modern websites since it takes the raw html, there's a lot of noise. A better implementation would use <https://github.com/mozilla/readability>.
>
> Note that we already have a special option to allow to search the web for more context. See [Web](ref:web)
