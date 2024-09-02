---
title: "Anonymous (Not intended for Production)"
slug: "anonymous-not-intended-for-production"
excerpt: ""
hidden: false
createdAt: "Mon Oct 16 2023 12:05:20 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:33:49 GMT+0000 (Coordinated Universal Time)"
---
To simplify your onboarding with polyfire, we added an "anonymous" login method.

It must first be activated in the dashboard in your project settings.

**After that, logging in should be automatic.**

You can also try to call it manually (after a logout for example) with:

```js Javascript
login({ provider: "anonymous" });
```

If you want to simulate multiple users, the login function also provides you with the ability to add an email to differentiate them like this:

```js Javascript
login({ provider: "anonymous", email: "user@example.com"  });
```
