---
title: "web"
slug: "web"
excerpt: "Connect your model to the web"
hidden: false
createdAt: "Tue Sep 12 2023 09:00:10 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:44:07 GMT+0000 (Coordinated Universal Time)"
---
The `generate` function, provisioned by Polyfire, is architectured to streamline the process of task-based text generation. This document provides a granular exploration of the `web` option, elucidating both its functionality and implementation.

***

### Web Option

The Web option offers a seamless integration of any LLM supported by Polyfire with internet resources.

To leverage this capability, set the `web` attribute to `true` when invoking the `generate` function:

```typescript
generate("your_task_here", { web: true });
```

Upon activation, the LLM can autonomously issue requests to web domains, distill pertinent data, and craft responses that align meticulously with your prescribed task.

For scenarios demanding specific website referencing, URLs can be embedded directly into the task with the `read:` prefix:

```typescript
generate("summarize this website read:https://example.com/" , { web: true })
```

Moreover, to juxtapose or amalgamate data from multiple domains, simply append multiple links in a similar fashion:

```typescript
generate("Compare this website read:https://example.com/milk-is-good with this one read:https://example.com/milk-is-bad")
```

Upon invoking the `web` option, the `options` parameter conforms to the `GenerationWithWebOptions` type, which inherently extends the attributes of `GenerationSimpleOptions`:

```typescript
type GenerationWithWebOptions = {
    provider?: "openai" | "cohere" | "llama" | "";
    model?: string;
    stop?: string[];
    temperature?: number;
    infos?: boolean;
    language?: Language;
} & { web: true };
```

> **WARNING:** So the web attribute is incompatible with the Chat, Memory, and SystemPrompt options.

### 💡 Example

```typescript
import {  GenerationWithWebOptions } from 'polyfire-js';

// In React:
const { models: { generate } } = usePolyfire();
// In other environments:
const { models: { generate } } = polyfire;

// Define task, options, and client configurations
const task = "What is the weather like in Paris today?";

const generationOptions: GenerationWithWebOptions = {
  provider: "openai",
  model: "gpt-3.5-turbo",
  Web: true
};

try {
  const result = await generate(task, generationOptions);
  console.log("Generated Output:", result);

} catch (error) {
  console.error("Generation encountered an anomaly:", error);
}
```

## Potential Errors and Troubleshooting:

### 1. `error_website_exceeds_limit`:

**Description:** This error is raised when the content from a single website has a token count that exceeds the model's context size.

**Troubleshooting Steps:**

- Double-check the website content. Large websites or those with extensive data might cause this issue.
- Opt to use a summary or an abridged version of the website if possible.
- Ensure that you are using the appropriate model that can handle the content size.

### 2. `error_websites_content_exceeds`:

**Description:** This error is raised when the accumulated content from multiple websites exceeds the model's context size.

**Troubleshooting Steps:**

- Limit the number of websites you are fetching content from.
- Prioritize and select only the most relevant websites.
- Consider using a different LLM that can handle larger content or splitting the content processing into multiple tasks.

### 3. `error_no_content_found`:

**Description:** This error indicates that no content was retrieved from the provided websites.

**Troubleshooting Steps:**

- Ensure that the provided URLs are correct and accessible.
- Make sure that the websites aren't blocking or limiting your content fetching requests.
- Verify that the websites have readable content and are not primarily image-based or media-based without accompanying text.

### 4. `error_fetch_webpage`:

**Description:** An issue occurred when trying to fetch a webpage.

**Troubleshooting Steps:**

- Ensure you have a stable internet connection.
- Verify that the target website is up and accessible.
- Make sure that you are not making too many rapid requests which might cause rate limiting.

### 5. `error_parse_content`:

**Description:** This error is raised when there's an issue parsing the content of a fetched webpage.

**Troubleshooting Steps:**

- Ensure that the website's content is structured in a way that's readable by the parsing method.
- Verify if the website uses unconventional structures or layouts that might be causing the parser to fail.

### 6. `error_visit_base_url`:

**Description:** This error indicates a problem occurred when trying to visit the base URL during scraping.

**Troubleshooting Steps:**

- Confirm that the base URL is correct and reachable.
- Ensure that the base URL allows for scraping and does not have restrictions like CAPTCHAs or bot blockers.
