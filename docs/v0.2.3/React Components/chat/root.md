---
title: "Root"
slug: "root"
excerpt: ""
hidden: true
createdAt: "Fri Jan 12 2024 09:24:26 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Overview

The `Root` component is essential in your app for managing chat functionality. It centralizes data, handles theme customization, configures chat options, manages user authentication and more. Essentially, it's the core component that orchestrates the entire chat experience.

# Props

- `children`: _Optional_. ReactNode elements to be rendered inside the component.
- `UnauthenticatedViewComponent`: _Optional_. A React component displayed when the user is not authenticated.
- `baseChatColor`: _Optional_. Specifies the base color for the chat theme. Acceptable values are `'light'`, `'dark'`, `'auto'`, a hex color code (e.g., `'#ff00ff'`), or a `CustomChatColor` object.
- `fullscreen`: _Optional_. A boolean to determine if the chat should be displayed in fullscreen mode.
- `options`: _Optional_. Chat options excluding 'chatId', derived from `ChatOptions`.

# Types

```typescript
export type CustomChatColor = {
  50?: string;
  100?: string;
	...
  800?: string;
  900?: string;
};

export type ChatUIProps = {
  UnauthenticatedViewComponent?: React.ComponentType<{
    login: Login;
    providers?: Provider[];
  }>;
  baseChatColor?: 'light' | 'dark' | 'auto' | `#${string}` | CustomChatColor;
  children?: ReactNode;
  fullscreen?: boolean;
  options?: Omit<ChatOptions, 'chatId'>;
};
```

# Example

```typescript
<Chat.Root baseChatColor="dark" fullscreen={true} options={options}>
  <ExampleChatWindow />
</Chat.Root>
```
