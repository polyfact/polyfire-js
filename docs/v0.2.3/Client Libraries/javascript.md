---
title: "Javascript"
slug: "javascript"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Sep 12 2023 08:49:03 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Nov 03 2023 01:23:26 GMT+0000 (Coordinated Universal Time)"
---
> **_NOTE:_**
>
> _If you're using React, we recommend to use the [usePolyfire hook](doc:usepolyfire)_

## With NPM

First install the Polyfire SDK:

```Text Bash
npm install polyfire-js
```

Import the `PolyfireClientBuilder` object

```javascript
import PolyfireClientBuilder from "polyfire-js";
```

## Without NPM

You can initialize Polyfire by importing the browser minified script:

```html
<script src="https://github.com/polyfire-ai/polyfire-js/releases/download/0.2.7/polyfire-min-0.2.7.js"></script>
```

The `PolyfireClientBuilder` object is added as a global variable in the window object

## Using the _polyfire_ Object

You can check if the user is already connected by using the `polyfire.auth.init()` function

If they aren't we'll have to use the `polyfire.auth.login(provider: string)` method to connect them first

```js Javascript
const polyfire = PolyfireClientBuilder({ project: "your_project_alias" })

const isAuthenticated = await polyfire.auth.init();
if (!isAuthenticated) {
  await polyfire.auth.login("github")
}

const helloWorld = await polyfire.models.generate("Write me a hello world haiku");
console.log(helloWorld);
```
