---
title: "History"
slug: "chat-1"
excerpt: ""
hidden: true
createdAt: "Fri Jan 12 2024 11:35:49 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# History

## Overview

The `History` component is a container designed for displaying conversation threads between a user and the bot. It supports different styles of chat bubbles and components for empty or loading states.

## Props

- `HistoryItemComponent`: _Required_. A component that renders individual chat messages. Accepts all props of a `Message`.
- `HistoryEmptyComponent`: _Required_. A component displayed when there is no conversation history.
- `HistoryLoadingComponent`: _Required_. A component shown while the conversation history is loading.
- Extends all the props of a standard `<div>` element, allowing for additional custom styles and attributes.

```typescript
export type HistoryProps = HTMLAttributes<HTMLDivElement> & {
  HistoryEmptyComponent: React.ComponentType;
  HistoryItemComponent: React.ComponentType<Message>;
  HistoryLoadingComponent: React.ComponentType;
};
```

## Example

```typescript
<Chat.History
  HistoryItemComponent={ExampleItemComponent}
  HistoryLoadingComponent={ExampleLoadingComponent}
  HistoryEmptyComponent={ExampleEmptyComponent}
>
  // Chat history or loading/empty components will be displayed here
</History>
```

***

## `Bubble` Style Components for `History`

As said Before, the `History` component can be enhanced with specific styles and functionalities using `Bubble` style components. These components render user and bot messages with distinct bubble-like styles.

### Usage in `History` Component

These components can be integrated into the `History` component as follows:

```typescript
<Chat.History
  HistoryItemComponent={Chat.BubbleChatListItem}
  HistoryLoadingComponent={Chat.BubbleHistoryLoadingComponent}
/>
```

## `Minimal` Style Components for `History`

In addition to the `Bubble` style, the `History` component can also be configured with `Minimal` style components. These components offer a simpler and more streamlined look for rendering chat messages, suitable for interfaces that prefer a less embellished design.

### Integration with `History` Component

These components can be seamlessly integrated into the `History` component for a minimalistic chat interface:

```typescript
<Chat.History
  HistoryItemComponent={Chat.MinimalChatListItem}
  HistoryLoadingComponent={Chat.MinimalHistoryLoadingComponent}
/>
```

## `Rounded` Style Components for `History`

Alongside the `Bubble` and `Minimal` styles, the `History` component can also be configured with `Rounded` style components. These components offer a more visually appealing design with rounded corners.

### Integration with `History` Component

These components can be integrated into the `History` component for a chat interface with rounded elements:

```typescript
<Chat.History
  HistoryItemComponent={Chat.RoundedChatListItem}
  HistoryLoadingComponent={Chat.RoundedHistoryLoadingComponent}
/>
```

## HistoryEmptyComponent

We provide a simple `HistoryEmptyComponent` for scenarios where there are no messages in the chat like a new chat. 

```typescript
<Chat.History
  HistoryEmptyComponent={Chat.HistoryEmptyComponent} 
/>
```

> ℹ️ `History` component's elements like `HistoryEmptyComponent` and others are optional, allowing you to use provided ones or create custom versions for your chat interface's needs.
