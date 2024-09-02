---
title: "infos"
slug: "infos"
excerpt: ""
hidden: false
createdAt: "Tue Sep 12 2023 09:00:17 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:44:07 GMT+0000 (Coordinated Universal Time)"
---
The `infos`method, when used with Polyfire`generate` function, lets you see more details about how the text is created.

### Infos Option

Use the `infos` method to get a report showing token use (what goes in and comes out) and the resources the model uses when creating text with the `web`, `memory` or `data` options. This is helpful for seeing how the model works, its costs, and figuring out where the created content comes from.

To use the `infos` feature, call the `infos` method of the result of the `generate` function:

```typescript
generate("your_task_here").infos();
```

When turned on, the `generate` function gives back a `GenerationResult` that includes:

```
type GenerationResult = {
    result: string;  // The generated content
    tokenUsage: {    // Token usage for input and output
        input: number;
        output: number;
    };
    ressources?: Ressource[];  // Resources or embeddings used during generation
};

```

### TokenUsage

A part of `GenerationResult`, `TokenUsage` shows clearly the tokens used in a specific text creation task:

```typescript
type TokenUsage = {
    input: number;  // Tokens consumed for the input task.
    output: number; // Tokens generated as output.
};
```

This feature is especially valuable for understanding model computation costs and ensuring you're not overshooting token limitations.

### Ressource

`Ressource` arrays encapsulate and present the various resources from `web`, `memory` or `data` that the model relied upon during generation:

```typescript
type Ressource = {
    similarity: number;  // Similarity score between resource and generated content.
    id: string;          // Unique identifier of the resource.
    content: string;     // Actual content of the resource.
};
```

This data can be leveraged to trace back the origins of generated content.

💡 **Example**

```typescript
// In React:
const { models: { generate } } = usePolyfire();
// In other environments:
const { models: { generate } } = polyfire;

// Define task, options, and client configurations
const task = "Explain the concept of quantum entanglement.";

const generationOptions: GenerationWithInfosOptions = {
  provider: "openai",
  model: "gpt-3.5-turbo",
  memoryId: "your_memory_id",
};

try {
  const result = await generate(task, generationOptions).infos();
  console.log("Generated Output:", result.result);
  console.log("Token Usage:", result.tokenUsage);
  console.log("Resources Used:", result.ressources);

} catch (error) {
  console.error("Generation faced an inconsistency:", error);
}

```
