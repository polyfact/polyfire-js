---
title: "View"
slug: "test"
excerpt: ""
hidden: true
createdAt: "Fri Jan 12 2024 09:25:10 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Overview

The View component serves as a versatile container, ideally suited for displaying various elements such as chat interfaces, settings panels, or other pages.

# Props

- `children`: _Required_. Allows you to pass child elements or components to the `View` component
- Extends all the props of a standard `<div>` element, allowing for additional custom styles and attributes.

```typescript
type ViewProps = {
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
```

# Example

```typescript
<Chat.View>
  <Text>Welcome to the app!</Text>
</Chat.View>
```
