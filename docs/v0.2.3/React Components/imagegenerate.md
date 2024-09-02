---
title: "ImageGenerated"
slug: "imagegenerate"
excerpt: "Display an image generated based on a prompt"
hidden: false
createdAt: "Mon Jan 08 2024 14:44:44 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
# Description

This component lets you generate and display and image based on a specific prompt and model. It otherwise extends a simple `<img />` element. You can set the `model` through the corresponding prop. Check our complete models list on [your dashboard](https://beta.polyfire.com) at / Models / List. `loadingElement` lets you set an element that will appear when the image is loading.

# Props

- `prompt`: A string that serves as the input for the image generation process.
- `model`: A string indicating the specific AI model to be used for generating the image. 
- `loadingElement`: Optional. A JSX element or string that is displayed while the image is being generated.
- Extends all the standard `<div>` element props, allowing for additional custom styles and attributes.

```typescript
interface ImageGeneratedProps extends React.HTMLAttributes<HTMLDivElement> {
    prompt: string;
    model: string;
    loadingElement?: React.JSX.Element | string;
}
```

# Example

```typescript
<ImageGenerated
  prompt="A description of the image to be generated"
  model="ModelName"
  loadingElement={<YourCustomLoadingSpinner />}
  // Additional props like className, style, etc.
/>
```
