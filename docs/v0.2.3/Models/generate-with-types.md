---
title: "generateWithType"
slug: "generate-with-types"
excerpt: ""
hidden: false
createdAt: "Mon Sep 11 2023 14:58:13 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:43:06 GMT+0000 (Coordinated Universal Time)"
---
> **WARNING:** Probabilistic functions  
> Theses functions cannot be guaranteed to work every time. Complex inputs can sometimes confuse the LLMs and lead them to throw an Error.

To define the schema we expose a modified version of `io-ts` that adds a way to describe your types.

For the example here, we want to describe a function given in input and extract its name, the name of its arguments and its return type.

```js javascript
import { t } from "polyfire";

// In React: const { models: { generateWithType } } = usePolyfire();
// In other environments: const { models: { generateWithType } } = polyfire;

const functionDescriptionType = t.type({
  functionName: t.string,
  description: t.string.description("A 50 word description of what the function does"),
  args: t.array(t.string).description("The name of the arguments"),
  returnType: t.string
});

const { functionName, description, args, returnType } = await generateWithType(
  "function add(a, b, c) { return a + b + c }",
  functionDescriptionType,
);

console.log(functionName) // add
console.log(description) // Adds three numbers together.
console.log(args) // ["a", "b", "c"]
console.log(returnType) // number
```
