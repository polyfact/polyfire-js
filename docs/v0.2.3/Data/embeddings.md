---
title: "Embeddings"
slug: "embeddings"
excerpt: "The embeddings are a simple way to create a long term memory and simplify the use of extracted information."
hidden: false
createdAt: "Mon Sep 11 2023 08:57:33 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Mon Mar 04 2024 07:11:34 GMT+0000 (Coordinated Universal Time)"
---
# Overview

1. Embeddings are a **data format using vectors** to store information in a way that can be **searched based on its semantic meaning**
2. Calling the `Embeddings()` class creates a **vector index** you can add data to 
3. Large inputs are **automatically split up** in chunks of about 512 tokens and added to the index
4. When **calling a LLM** with the embeddings index ID, **Polyfire automatically queries the most similar data** in your index and inject it in the LLM call as context

# Simple example

```javascript
// In React
const { data: { Embeddings } } = usePolyfire();
// In other environments:
const { data: { Embeddings } } = polyfire;

const index = Embeddings();
indexId = index.getId()
embeddings.add("The secret word is: banana42");
const secret = await polyfire.generate("What's the secret?", { embeddingsId: indexId });
console.log(secret); // Outputs: The secret word is "banana42".
```

# Embeddings() class

## Class prototype

```typescript
type EmbeddingsOptions = {
  id?: string, // This cannot be set at the same time as public since it gets an existing embedding index instead of creating a new one.
  public?: boolean, // Whether the content of your new embedding index should be accessible accross your project or restricted to a single user. Default is false.
} | string;

function Embeddings(options?: EmbeddingsOptions): embeddings;
async function embeddings.getId(): Promise<string>;
async function embeddings.add(input: string): Promise<void>;
async function embeddings.search(input: string): Promise<{ content: string, similarity: number }[]>
```

## New index

To create a new index, import the `Embedding` class from the `data` Polyfire module and instantiate it

```typescript
import { data } = polyfireClient;
const { Embeddings } = data;

const index = Embeddings()
```

## Index ID

To get the ID of an embeddings index, call the `getId()` function

```javascript
const id = await index.getId();
console.log(id);  // Outputs the ID of the embedding index
```

## Retrieve an index

Pass an embeddings ID in options to retrieve previously created indexes

```javascript
const existingIndex = Embeddings("yourEmbeddingsIndexId");
// or
const existingIndex = Embeddings({ id: "yourEmbeddingsIndexId" });
```

## Add data

You can add new data to your embeddings using the `add` method

```javascript
index.add("My house is yellow");
```

## Search index

The `search()` function looks for semantically similar data in an embeddings index

```javascript
const [{ content }] = await index.search("My house is pink");

console.log(content); // My house is yellow
```

# getAllEmbeddings()

This function returns all the embedding indexes that have been created.
