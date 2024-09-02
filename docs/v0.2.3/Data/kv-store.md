---
title: "KV Store"
slug: "kv-store"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Sep 12 2023 08:31:14 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Oct 18 2023 20:57:45 GMT+0000 (Coordinated Universal Time)"
---
Polyfire exposes a simple persistent key value store for each user of each project.

_NOTE: The kv store only stores string. If you want to store something more complex, you can use JSON.stringify_

## 💡 Example

To set a value:

```js Javascript
// In React:
const { data: { kv } } = usePolyfire();
// In other environments:
const { data: { kv } } = polyfire;

await kv.set("my_key", "my_value");
```

The value can later be retieved with kv.get:

```js Javascript
console.log(await kv.get("my_key")); // Should print "my_value"
```
