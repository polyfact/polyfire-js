---
title: "login"
slug: "login"
excerpt: "Login users with Polyfire Auth"
hidden: false
createdAt: "Wed Sep 27 2023 07:29:51 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:33:49 GMT+0000 (Coordinated Universal Time)"
---
> 📘 Auth is required
> 
> All the components and functions in the SDK require you to connect your users to Polyfire Auth.
> 
> Because all calls to the Polyfire API use LLMs (and therefore cost money) or access user data, the client needs some kind of secured authentification.
> 
> You don't need to authenticate your users entirely through Polyfire (e.g. we can authenticate your Firebase or Supabase user tokens). If you need a custom auth provider integrated, [tell us on Discord](https://discord.polyfire.com).

Login users client-side to create unique user sessions.

- Works with providers "Google" and "GitHub" but also "Firebase" (see below).
- Must be called to use _models_ and _data_ modules client-side. 

```typescript
export declare function login(input: LoginFunctionInput, projectOptions: {
    project: string;
    endpoint: string;
}): Promise<void>;
```

## Types

```typescript
type SimpleProvider = "github" | "google";
type LoginWithFirebaseInput = {
    token: string;
    provider: "firebase";
};
type LoginFunctionInput = SimpleProvider | {
    provider: SimpleProvider;
} | LoginWithFirebaseInput;
```
