---
title: "usePolyfire"
slug: "usepolyfire"
excerpt: "Polyfire provides a hook to simplify the login process of your users in React."
hidden: false
createdAt: "Tue Sep 12 2023 08:46:37 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Mon Nov 27 2023 06:34:25 GMT+0000 (Coordinated Universal Time)"
---
> **_NOTE:_**
>
> _The usePolyfire hook is a React Hook_
>
> _If you're not using React, please follow this page instead: [Importing polyfire](doc:javascript)_

## Importing Polyfire

First install the Polyfire SDK:

```bash Bash
npm install polyfire-js
```

## Usage

### PolyfireProvider

You will need to wrap your app in the Polyfire Provider to be able to use the usePolyfire hook. Pass your project id to the PolyfireProvider

```jsx Javascript
root.render(
  <PolyfireProvider project="your_project_alias">
  	<App />
  </PolyfireProvider>
);
```

### Hook: usePolyfire

The usePolyfire hook exports a client with all the Polyfire functions, to use most of them you will first need to login. The authentification functions are exported like this:

```js Javascript
const { auth: { login, logout, status }, models: { generate } } = usePolyfire();
```

All of the functions except the login function requires the user to be authenticated before calling them. You can check whether you're authenticated with `status`. `status` can be `authenticated`, `unauthenticated` and `loading`.

```js Javascript
if (status === "authenticated") {
  const haiku = await generate("Generate a hello world haiku");
  console.log(haiku);
}
```

The login function takes the login provider as a parameter.

```jsx Javascript
<button onClick={() => login("github")}>Login with Github</button>
```

**WARNING: For now, the only login provider available are GitHub, Google [and Firebase](doc:signin-firebase), we will add more in the future**

To logout, use the logout function

```jsx Javascript
<button onClick={() => logout()}>Logout</button>
```
