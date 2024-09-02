---
title: "TextTranslated"
slug: "text-summarize"
excerpt: "Display the translation of a text"
hidden: false
createdAt: "Mon Jan 08 2024 14:44:24 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Description

This component displays a translation of the text you pass through the `text` prop. The `language` prop sets the language to translate into. No need to follow a specific list of languages, "French" or "french" or "français" would all work. ("französisch" would probably even work if your text is originally in Spanish). `loadingElement` lets you pass in a component to display when the summary is loading.

> 📘 Pay only once
> 
> In this component results for a specific text are cached by the Polyfire API, so you only pay the costs of the LLM generation once per unique text translated.

# Props

- `text`: A string that represents the text to be translated.
- `language`: A string specifying the language code into which the text should be translated.
- `loadingElement`: Optional. A JSX element or string to be shown while the translation is loading. 
- Extends all the props of a standard `<div>` element, allowing for additional custom styles and attributes.

```typescript
interface TextTranslatedProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string;
    language: string;
    loadingElement?: React.JSX.Element | string;
}
```

# Example

```typescript
<TextTranslated
  text="Your text to translate goes here"
  language="es"
  loadingElement={<YourCustomLoadingSpinner />}
  // Other props like className, style, etc. can be added here
/>
```
