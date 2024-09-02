---
title: "AutoCompleteInput"
slug: "auto-complete-input"
excerpt: "Input component with auto-complete suggestions"
hidden: false
createdAt: "Mon Jan 08 2024 15:18:11 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Description

A regular input component with an auto-complete placeholder. When a user types some text, the component waits for a 1 second break, and then sends a query to GPT-3.5 to suggest the next couple of words. The users can accept the suggestion with the Tab key.

# Props

- `completionColor`: Specifies the color of the auto-complete text.
- `containerStyle`:  Defines the styling for the component's container.
- `containerClassName`: CSS class name for the component's container
- Extends all the props of a classic `<input />` component

# Example

```typescript
<AutoCompleteInput
  placeholder="Type something here..."
  containerClassName="mb-4"
  className="placeholder-stone-200"
/>
```
