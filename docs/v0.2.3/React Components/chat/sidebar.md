---
title: "Sidebar"
slug: "sidebar"
excerpt: ""
hidden: true
createdAt: "Fri Jan 12 2024 09:52:20 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Jan 12 2024 13:54:15 GMT+0000 (Coordinated Universal Time)"
---
# Sidebar Container

## Overview

The `Sidebar` component in React is designed to be a dynamic and interactive sidebar that can be toggled on or off. It is highly suitable for navigation menus, information panels, or any content that needs to be accessible alongside the main content.

## Props

- `children`: _Optional_. This prop allows you to pass child elements or components to the `Sidebar` component. 
- Extends all the props of a standard `<div>` element, making it highly flexible for various HTML attributes and custom styles.

```typescript
export type SidebarProps = {
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
```

## Example

```typescript
<Chat.Sidebar>
  <ExampleNavigationMenu />
  <ExampleUserProfile />
  <ExampleSettingsPanel />
</Chat.Sidebar>
```

***

# SidebarHeader

## Overview

The `SidebarHeader` component is designed to create a flexible and customizable header for sidebar layouts. It's perfect for integrating a logo, custom titles, and additional styling options in your application's sidebar.

## Props

- `Logo?`: _Optional_. For inserting your own logo.
- `name?`: _Optional_. Sets sidebar title text, accepting either string or `ReactNode`.
- `containerProps?`: _Optional_. Customizes HTML attributes of the `<div>` container.
- `logoProps?`: _Optional_. Customizes SVG attributes and styling for the logo.
- `titleProps?`: _Optional_. Alters HTML attributes and styles for the title `<h2>` element.

```typescript Typescript
export type SidebarHeaderProps = {
  Logo?: ComponentType<{ className?: string }>;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  logoProps?: React.SVGAttributes<SVGSVGElement>;
  name?: string | ReactNode;
  titleProps?: React.HTMLAttributes<HTMLHeadingElement>;
};
```

## Example

```typescript
<Chat.SidebarHeader
  Logo={MyLogo}
  name="My App"
  containerProps={{ className: 'custom-container' }}
  logoProps={{ className: 'custom-logo' }}
  titleProps={{ className: 'custom-title' }}
/>
```

***

# SideBar ChatList

## Overview

The `ChatList` component is designed to render the list of your previous chats, offering functionality like deleting, or renaming chats. It leverages context from the `ChatProvider` to access chat data and utility functions.

## Props

- Inherits all properties from `HTMLAttributes<HTMLDivElement>`, enabling the addition of standard HTML attributes.

```typescript
type ChatListProps = React.HTMLAttributes<HTMLDivElement>;
```

## Utilities

The component utilizes several utility functions from the `ChatProvider`:

- `selectChat`: Function to handle the selection of a chat.
- `deleteChat`: Function to delete a chat.
- `renameChat`: Function to rename a chat.

# Example

```typescript Typescript
<Chat.ChatList className="custom-chatlist-style">
  {/* Chat items are rendered here */}
</Chat.ChatList>
```

***

# SidebarButtonGroup

## Overview

The `SidebarButtonGroup` component is designed as a customizable container for a group of buttons used in the `SideBar`.

## Props

- `children`: _Required_. Allows you to insert child elements or components.
- Extends all the props of a standard `<div>` element, offering additional flexibility for styling and behavior.

## Example

```typescript
<Chat.SidebarButtonGroup className="custom-class">
  <Button>Home</Button>
  <Button>Settings</Button>
</Chat.SidebarButtonGroup>
```

***

# SideBar LogoutButton

## Props

- `icon`: _Optional_. Allows the insertion of a custom icon. Defaults to a standard logout icon.
- `label`: _Optional_. Text label for the button. Defaults to 'Sign Out'.
- Extends all the props of a standard `<button>` element, enabling additional HTML button attributes.

## Example

```typescript
<Chat.LogoutButton
  className="custom-logout-button"
  label="Exit"
	icon={<MdLogout />}
/>
```

***

# SideBar NewChatButton

## Props

- `icon`: _Optional_. Accepts a React node to display an icon within the button. Default is `<AddIcon />`.
- `label`: _Optional_. A string to specify the text label of the button. Default is 'New Chat'.
- `onClick`: _Optional_. A function handling the click event on the button.
- Extends all the props of a standard `<button>` element, providing flexibility for further customization and functionality.

## Example

```typescript
<Chat.NewChatButton
  className="custom-class"
  icon={<CustomIcon />}
  label="Start Chat"
/>
```

***

# SidebarButton

## Overview

The `SidebarButton` component is a generic button designed for use in sidebars, allowing for the creation of various button styles within `SidebarButtonGroup`.

## Props

- `icon`: _Optional_. A React node for adding an icon to the button.
- `label`: _Required_. Text label displayed on the button.
- Extends all the props of a standard `<button>` element.

## Example

```typescript
<SidebarButton
  className="custom-button-class"
  icon={<IconName />}
  label="Button Label"
/>
```
