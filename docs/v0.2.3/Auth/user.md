---
title: "user"
slug: "user"
excerpt: ""
hidden: false
createdAt: "Wed Sep 27 2023 07:39:48 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:33:49 GMT+0000 (Coordinated Universal Time)"
---
User object with Auth and Token IDs. 

- Give you access to a unique userID
- Useful to mesure rateLimit and user's usage if you want to trigger a paywall / payment flow.

```typescript
export type UserClient = {
    usage: () => Promise<{
        usage: number;
        rateLimit?: number;
    }>;
    getAuthID: () => Promise<string>;
    getToken: () => Promise<string>;
};
```
