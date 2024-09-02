---
title: "TextGenerated"
slug: "text-generated"
excerpt: "Display the generated output of a LLM prompt"
hidden: false
createdAt: "Mon Jan 08 2024 17:20:02 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Description

This component displays a translation of the text you pass through the `text` prop. With the `stream` prop, you can set whether the result should be displayed as a stream or once in full when generated. `loadingElement` lets you pass in a component to display when the summary is loading.

> 📘 Pay only once
> 
> In this component results for a specific text are cached by the Polyfire API, so you only pay the costs of the LLM generation once per unique text generated.

# Props

- `prompt`: A string that serves as the input or trigger for text generation.
- `stream`: Optional boolean. When set to true, the component supports real-time data streaming.
- `loadingElement`: Optional. A JSX element or string to display while the text generation is in progress.
- Extends all the standard `<div>` element props, enabling the application of custom styles and other HTML attributes.

```typescript
export interface TextGeneratedProps extends React.HTMLAttributes<HTMLDivElement> {
    prompt: string;
    stream?: boolean;
    loadingElement?: React.JSX.Element | string;
}
```

# Example

```typescript
<TextGenerated
  prompt="Start of your story or content"
  stream={true}
  loadingElement={<YourCustomLoadingSpinner />}
  // Additional props like className, style, etc.
/>
```
