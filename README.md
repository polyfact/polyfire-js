# PolyFact

`polyfact` is a nodejs package aimed at assisting developers in creating project using AI.
The package is split into 2 parts:

-   The [**SDK**](#sdk) that can be imported in any nodejs project and provides the basic building blocks for AI tool developement
-   The [**CLI**](#cli) which is a bundle of dev-tools currently under active development, with documentation autogeneration as its functional feature at this stage.

## SDK

### Installation

To install polyfact into your repository:

```bash
npm install polyfact
```

Get your your polyfact token by signing up with github here: https://app.polyfact.com
Add your Polyfact Token in the `POLYFACT_TOKEN` environment variable:

```bash
export POLYFACT_TOKEN= # The token displayed on https://app.polyfact.com
```

### Usage

### Generating a completion

Polyfact allows you to generate AI responses with or without structured data. This flexibility in the output format makes it easier to handle the AI responses according to the needs of your application.

#### With Structured Data

The `generateWithType` function generates a response that matches a certain format or "type". This "type" is defined using the `io-ts` package, which allows you to define the shape of the response you want.

To use `generateWithType`, you need to:

1. Import `generateWithType` from polyfact.
2. Import `t` from `io-ts` to define the shape of your response.
3. Create a type with `t.type()`.
4. Pass the prompt and the type to `generateWithType()`.

Here's an example:

```js
import { generateWithType } from "polyfact";
import * as t from "io-ts";

(async () => {
    const result = await generateWithType(
        "Count from 1 to 5",
        t.type({ result: t.array(t.number) }),
    );

    console.log(result);
})();
```

In this example, `t.type({ result: t.array(t.number) })` defines the shape of the response we want. We want a JSON object with a key `result` and an array of numbers as its value.

The result will be a structured JSON data:

```bash
{ result: [1, 2, 3, 4, 5] }
```

#### Without Structured Data

If you do not need structured data, you can use the `generate` function, which will provide the generated response as a plain string. This function only requires the prompt as an argument.

Here's an example:

```js
import { generate } from "polyfact";

(async () => {
    const result = await generate("Count from 1 to 5");

    console.log(result);
})();
```

#### With Token Usage

If you want to keep track of token consumption during the generation process, you can use the `generateWithTokenUsage` function. It generates the AI response and also returns the token consumption in the input and output.

Here's an example:

```js
import { generateWithTokenUsage } from "polyfact";

(async () => {
    const { result, tokenUsage } = await generateWithTokenUsage("Count from 1 to 5");

    console.log("Generated text:", result);
    console.log("Token usage:", tokenUsage);
})();
```

In this example, the result will include the generated text and the number of tokens used for the input and output:

```bash
Generated text: 1, 2, 3, 4, 5
Token usage: { input: 4, output: 10 }
```

These functions provide a great deal of flexibility in how you generate and handle AI responses in your project. You can choose the one that best suits your needs.

### Creating a new memory

Creating a new memory involves generating a unique memory ID that will be used to store embedded data.

This process is abstracted by the SDK and requires no parameters.

```typescript
import { createMemory } from "polyfact";

(async () => {
    const memory = await createMemory();
    console.log(memory); // Outputs: { id: '...' }
})();
```

The resulting memory object contains a unique id that represents the new memory. This id will be used when updating the memory or referencing it in other operations.

### Updating an existing memory

Updating an existing memory involves adding embedded data to a previously created memory.

To do this, you'll need the unique memory ID that was generated when the memory was created.

The `updateMemory` function takes two parameters:

1. The unique memory id.
2. The data to be embedded into the memory.

```typescript
import { updateMemory } from "polyfact";

(async () => {
    const result = await updateMemory("<memory-id>", "<input-data>");
    console.log(result); // Outputs: { success: true }
})();
```

The `"<input-data>"` should be replaced with the actual data you want to embed into the memory.

The function returns an object that contains a `success` boolean property indicating whether the operation was successful.

### Getting all memories

The `getAllMemories` function retrieves the ids of all memories that have been created. This can be useful when you want to inspect all of your memories or perform operations on multiple memories.

```typescript
import { getAllMemories } from "polyfact";

(async () => {
    const memories = await getAllMemories();
    console.log(memories); // Outputs: { ids: ['...', '...', ...] }
})();
```

This function returns an object with an `ids` property, which is an array containing the ids of all created memories.

### Generate response using memory

The `generate` function uses the AI model to generate a response. You can optionally provide the id of a memory created using `createMemory`. The AI will match the prompt with the embedded data in the memory and include the most relevant embeddings in the context.

```typescript
import { generate } from "polyfact";

(async () => {
    const response = await generate("<prompt>", "<memory-id>");
    console.log(response); // Outputs: '...'
})();
```

The `"<prompt>"` should be replaced with the task or question you want to generate a response for. If a `"<memory-id>"` is provided, the AI will consider the embedded data in the specified memory when generating the response.

### Defining Types for Structured Responses

In order to structure the responses from the PolyFact AI, you can define a custom type using the `io-ts` package included in polyfact. This package provides a `t` object, from which you can access different functions to define your custom types. You can chain these functions with `.description()` method to provide an explanation to the AI about what information should be included in each field.

Below is a hypothetical example of a Book Review type:

```js
import { t } from "polyfact";

const AuthorType = t.type({
    name: t.string.description("The name of the author of the book."),
    nationality: t.string.description("The nationality of the author."),
});

const BookReviewType = t.type({
    title: t.string.description("The title of the book being reviewed."),
    author: AuthorType,
    review: t.string.description("A brief review of the book."),
    rating: t.number.description("A rating for the book from 1 to 5."),
    recommend: t.boolean.description("Would you recommend this book to others?"),
});

const ResponseBookReview = BookReviewType;
```

In this example, `BookReviewType` is a custom type that represents a book review. It includes the title of the book, the author's information (which is another custom type `AuthorType`), a brief review of the book, a numerical rating, and a recommendation.

By defining a type with `t.type()`, you specify the shape of the response that you want from the AI. You then pass this type to `generateWithType()` function along with the prompt. The AI will then return a response that fits the format of the defined type.

This feature allows for more structure in the data that you receive from the AI, making it easier to handle and use in your application.

### Full Example

In this example, we'll demonstrate how to create a new memory, update it with some data, retrieve all memories, and generate a response using a memory.

```typescript
import { createMemory, updateMemory, getAllMemories, generate } from "polyfact";

(async () => {
    const memory = await createMemory();
    console.log("Created memory:", memory); // Outputs: { id: '...' }

    const result = await updateMemory(memory.id, "<input-data>");
    console.log("Updated memory:", result); // Outputs: { success: true }

    const memories = await getAllMemories();
    console.log("All memories:", memories); // Outputs: { ids: ['...', '...', ...] }

    const response = await generate("<prompt>", memory.id);
    console.log("Generated response:", response); // Outputs: '...'
})();
```

## CLI

`polyfact` uses the following command structure for documentation generation:

```bash
npx polyfact docs <folder> [options]
```

### Arguments

-   `<folder>`: This is the path of the folder from which to generate the documentation. This argument is mandatory.

### Options

-   `-n, --name <doc_name>`: This is the name of the documentation. If not provided, it defaults to 'id'.

-   `-d, --deploy <subdomain>`: This option allows you to provide a subdomain to which the generated documentation will be deployed.

-   `--doc_id <doc_id>`: If the doc_id has already been generated, you can send it as an argument here.

## Examples

```bash
# Generate documentation from the src folder with the default parameters
npx polyfact docs ./src

# Generate documentation with a specific name from the src folder and output to a specific folder
npx polyfact docs ./src --name "my-documentation"

# Generate documentation and deploy it to a specific subdomain
npx polyfact docs ./src --deploy my-subdomain
```

## Future Enhancements

`polyfact` is planned to support more dev-tools features in the near future. Stay tuned for more enhancements that would aid you with AI features.
