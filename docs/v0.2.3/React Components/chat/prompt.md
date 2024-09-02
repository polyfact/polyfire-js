---
title: "Prompt"
slug: "prompt"
excerpt: ""
hidden: true
createdAt: "Fri Jan 12 2024 11:30:19 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Prompt

## Overview

The `Prompt` component acts as a container for elements related to prompt handling, such as send buttons or Input.

## Props

- `children`: _Required_. Content to be displayed inside the `Prompt` component.
- Extends standard HTML div attributes for additional customization.

## Example

```typescript
<Chat.Prompt className="custom-prompt-class">
  <Button>Send</Button>
	<Chat.Input />
</Chat.Prompt>
```

***

# Input

## Overview

The `Input` component is a text input designed for typing prompts to be sent to a language model. It features an autosizing textarea.

## Props

- Extends `TextareaProps` which includes standard HTML textarea attributes like `placeholder`, `disabled`, etc.

## Example

```typescript
<Chat.Input
  placeholder="Type a message..."
  style={{ minHeight: '50px', color: 'blue' }}
  className="custom-input-class"
/>
```

***

# SendButton

## Overview

The SendButton component is a specialized control within the Prompt container, designed to facilitate the sending of requests to LLM. 

## Props

- `icon`: _Optional_. A ReactNode that represents the icon displayed on the button. Defaults to a SendIcon.
- `label`: _Optional_. A string that specifies the accessible label for the button. Defaults to "Send Message".
- Extends all the props of a standard `<button>` element, offering additional customization options for attributes like `onClick`, `style`, etc.

## Example

```typescript
<SendButton
  className="custom-send-button"
  icon={<CustomIcon />}
  label="Custom Send"
/>
```
