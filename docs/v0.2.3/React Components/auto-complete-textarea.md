---
title: "AutoCompleteTextArea"
slug: "auto-complete-textarea"
excerpt: "Textarea component with auto-complete suggestions"
hidden: false
createdAt: "Mon Jan 08 2024 15:17:59 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Description

This component is a regular Textarea component. But after the user has stopped typing for 1 second, it calls GTP-3.5 to ask for a suggestion on the next couple of words. The user can accept the suggestion with the Tab key.

It's like [AutoCompleteInput](ref:auto-complete-input) but for a Textarea.

# Props

- Extends all the props of a standard `<textarea />` component.

# Example

```typescript
<AutoCompleteTextArea
  placeholder="Type something here..."
  rows={5}
/>
```
