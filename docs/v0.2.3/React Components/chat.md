---
title: "ChatBot"
slug: "chat"
excerpt: ""
hidden: true
createdAt: "Thu Jan 11 2024 11:03:29 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
## 🚨 Important Note on ChatBot Component

The ChatBot component differs from our basic LLM component libraries, offering a range of advanced, chat-focused components. It has its own distinct library, setting it apart from our simpler components:  
[`@polyfire-ai/chat-ui`](https://www.npmjs.com/package/@polyfire-ai/chat-ui)

## Overview of `@polyfire-ai/chat-ui`

The `@polyfire-ai/chat-ui` library is a comprehensive React component library designed to create interactive chatbots integrated with Large Language Models (LLMs). 

### Key Components

1. **`Root` Component**: Serves as the core of your chat application. It manages chat functionalities including theme customization, user authentication, and chat options.

2. **`Sidebar` and Related Components**: 
   - `Sidebar`: A dynamic sidebar for navigation menus, user profiles, and settings.
   - `SidebarHeader`: Customizable header for the sidebar, ideal for integrating logos and titles.
   - `ChatList`: Displays a list of chats with functionalities like deleting or renaming chats.
   - `SidebarButtonGroup`: A container for grouping buttons in the sidebar.
   - `LogoutButton` & `NewChatButton`: Specialized buttons for logout and initiating new chats.

3. **`View` Component**: A versatile container for displaying various UI elements such as chat interfaces and settings panels.

4. **`Prompt` and Input Elements**:
   - `Prompt`: A container for elements related to sending messages.
   - `Input`: A text input component for typing chat messages.
   - `SendButton`: A button for sending chat messages to the LLM.

5. **`History` Component**: Displays the conversation history in the chat, with options for different styles like `Bubble`, `Minimal`, and `Rounded`.

6. **Hooks and Utilities**:
   - `useChatContext`: A hook providing essential data and functions for chat management and interactions.

### Usage and Customization

The library allows for extensive customization and flexibility. Components can be styled and configured to match specific design requirements. The `useChatContext` hook enables the creation of custom components.

### Example Implementation

```jsx
import Chat from '@polyfire-ai/chat-ui'


const ChatBot = () => (
  <Chat.Root baseChatColor={'auto'}>
    <Chat.Sidebar>
      <Chat.SidebarHeader />
      <Chat.NewChatButton />
      <Chat.ChatList />
    </Chat.Sidebar>
    <Chat.View>
      <Chat.History
        HistoryItemComponent={Chat.RoundedChatListItem}
        HistoryLoadingComponent={Chat.RoundedHistoryLoadingComponent}
        HistoryEmptyComponent={Chat.HistoryEmptyComponent}
      />

      <Chat.Prompt>
        <Chat.Input />
        <Chat.SendButton />
      </Chat.Prompt>
    </Chat.View>
  </Chat.Root>
)
```
