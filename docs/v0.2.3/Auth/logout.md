---
title: "logout"
slug: "logout"
excerpt: ""
hidden: false
createdAt: "Wed Sep 27 2023 07:32:37 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:33:48 GMT+0000 (Coordinated Universal Time)"
---
Ends user session and cleans cache.

- Doesn't return anything.
- Will require user to re-authenticate user to use API modules. (models, data, etc).

```typescript
export declare function logout(): Promise<void>;
```
