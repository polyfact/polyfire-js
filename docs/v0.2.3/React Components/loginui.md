---
title: "Login"
slug: "loginui"
excerpt: "UI for logging into Polyfire Auth"
hidden: false
createdAt: "Mon Jan 08 2024 14:44:53 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
> 📘 Auth is required
> 
> All the components and functions in the SDK require you to connect your users to Polyfire Auth.
> 
> Because all calls to the Polyfire API use LLMs (and therefore cost money) or access user data, the client needs some kind of secured authentification.
> 
> You don't need to authenticate your users entirely through Polyfire (e.g. we can authenticate your Firebase or Supabase user tokens). If you need a custom auth provider integrated, [tell us on Discord](https://discord.polyfire.com).

# Description

Component UI to log in your users with Polyfire Auth. It displays Sign In with Google and GitHub. We can add more if you need them. [Tell us on Discord.](https://discord.polyfire.com)

It takes only two props for your Privacy Policy and Terms of Service. Everything else works automatically through the [PolyfireProvider](doc:usepolyfire). The other props are applied to to parent `<div />` component.

One specificity is that you need to pass as children the components you want to display when then user is logged in. (When the user isn't logged in, the component displays the login buttons.)

# Props

- `termsOfService`: Optional. A string URL to the Terms of Service of your application or website.
- `privacyPolicy`: Optional. A string URL to the Privacy Policy of your application or website.
- Extends all the standard `<div>` element props, allowing for additional customization of the parent container.

```typescript
interface LoginProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    termsOfService?: string;
    privacyPolicy?: string;
}
```

# Example

```typescript
<Login
  termsOfService="https://yourwebsite.com/terms"
  privacyPolicy="https://yourwebsite.com/privacy"
  // Additional props like className, style, etc.
>
  {/* Child components to display after user logs in */}
</Login>
```
