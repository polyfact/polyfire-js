---
title: "TextSummary"
slug: "text-summary"
excerpt: "Display a summary of a text"
hidden: false
createdAt: "Mon Jan 08 2024 14:44:16 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Description

This component displays a summary of the text you pass through the `prompt` prop. With the `stream` prop, you can set whether the result should be displayed as a stream or once in full when generated. `loadingElement` lets you pass in a component to display when the summary is loading.

> 📘 You only pay once
> 
> In this component results for a specific text are cached by the Polyfire API, so you only pay the costs of the LLM generation once per unique text summarized.

# Props

- `prompt`: A string that represents the text to be summarized.
- `stream`: Optional boolean. If set to true, the component handles real-time data streaming.
- `loadingElement`: Optional. A JSX element or string to be displayed while the summary is loading. 
- Extends all the props of a standard `<div>` element, allowing for custom styles and attributes to be applied.

```typescript
interface TextSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
    prompt: string;
    stream?: boolean;
    loadingElement?: React.JSX.Element | string;
}
```

- It otherwise extends all the props from the `<div />` element.

# Example

```typescript
<TextSummary
  prompt="Your text to summarize goes here"
  stream={true}
  loadingElement={<YourCustomLoadingSpinner />}
  // Additional props like className, style, etc.
/>
```
