---
title: "System Prompts"
slug: "system-prompts-alias"
excerpt: ""
hidden: false
metadata: 
  title: "System Prompts Alias"
  description: "In this guide, we'll help you use aliases for system prompts to simplify your code"
  image: []
  robots: "index"
createdAt: "Thu Nov 02 2023 10:39:07 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Nov 03 2023 16:12:07 GMT+0000 (Coordinated Universal Time)"
---
In the Polyfire-JS SDK, the `generate` function or `Chat` class allows the use of the `systemPrompt` option where your prompts are typically hardcoded. An alternative is the `systemPromptId` option which utilizes a UUID. However, remembering and managing these UUIDs can be a hassle.So you can use an alias generated from your prompt name. They provide a recognizable and easy-to-use name for your system prompts, tidying up your code and enhancing clarity.

## Setting Up Prompts

1. **Access System Prompts**: Enter your dashboard, choose your project, and navigate to the system prompts management area.

2. **Create a New Prompt**: 
   - Select `Prompts > Saved`.
   - Press the `New` button.
   - Input the name and prompt content, then save your new prompt.
   - If a prompt already exists, locate it in `Prompts > Saved`.

3. **Select a Prompt**: Identify the prompt you wish to use and copy its alias for use in your code.

_Note_: Your prompt's name should be distinctive as it forms the basis of the alias and should be easy to remember.

## Use Alias in Your Code

After setting up your custom prompt, you can use the alias with the `systemPromptId` in your code when engaging with polyfire-js SDK. Here's how:

```javascript
generate("Write a hello world haiku", {systemPromptId: "my_prompt_alias"})
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error); 
  });
```

In the snippet above, "my_prompt_alias" stands in for the system prompt's alias. The Polyfire API will use this alias to identify and execute the appropriate system prompt.
