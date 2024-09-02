---
title: "generateImage"
slug: "generate-image"
excerpt: "This features allows you to generate images easily from a prompt using dall-e"
hidden: false
createdAt: "Mon Sep 11 2023 09:01:05 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:44:07 GMT+0000 (Coordinated Universal Time)"
---
## Function: generateImage

**Prototype:**

```ts typescript
async function generateImage(prompt: string, options: GenerationOptions = {}): Promise<{ url: string }>
```

### 💡 Examples

The simplest way to use it:

```js javascript
// In React:
const { models: { generateImage } } = usePolyfire();
// In other environments:
const { models: { generateImage } } = polyfire;

const { url } = await generateImage("Pikachu"); // By default generateImage uses Dall-E to generate its images

console.log(url);
```

[block:image]
{
  "images": [
    {
      "image": [
        "https://hqyxaayiizqwlknddokk.supabase.co/storage/v1/object/public/generated_images/d70de08e-636e-4c78-b72e-a924b9d61464.png",
        null,
        "Cursed pikachu"
      ],
      "align": "center",
      "caption": "A cursed Pikachu"
    }
  ]
}
[/block]
