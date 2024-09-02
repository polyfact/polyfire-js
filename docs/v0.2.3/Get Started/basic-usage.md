---
title: "Basic Usage"
slug: "basic-usage"
excerpt: "This tutorial shows you how to use the Polyfire Backend SDK in your AI app."
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Sep 26 2023 06:38:49 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Nov 03 2023 02:27:03 GMT+0000 (Coordinated Universal Time)"
---
# How does it work?

Polyfire is a Managed Backend for AI apps. It means that your AI Backend is "abstracted" and you don't have to think about it. All you do is use some function in your Front End code to use AI models, embeddings (data vectorized by LLMs) and many other things you might need like smart prompts, data integrations, rate limits, billing integrations, etc.

Your user flow is the following: 

1. Create a project in the [Polyfire Developer Console](https://beta.polyfire.com). If you're unsure how to do that, you can follow [this tutorial here](doc:new-project-rate-limit).
2. Initializing the Polyfire in your Front End code
3. Call Polyfire SDK functions in your code to make your AI app

In the following guide, we will look into how to setup Polyfire client-side, and then how to use the core SDK functions to make a basic AI app.

# Requirements

To follow this tutorial, you need some kind of React App. Our documentation is mostly focused on React right now, even thought the underlying JavaScript code works for any JavaScript Front End library.

To setup a basic React App with TypeScript, run the command below.

```shell Shell
npx create-react-app <your_app_name> --template typescript  
cd <your_app_name>  
npm install polyfire-js
```

To run this app, you can use the command `npm start`.

***

# Setting up Polyfire in my Front End

## 1. Inject Polyfire in your app

In your _**index.tsx**_ or at the root of your client side-code, import the Polyfire Provider and wrap your app in it.

```jsx JSX
import ReactDOM from "react-dom/client";
import { PolyfireProvider } from "polyfire-js/hooks";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <PolyfireProvider project="your_project_alias">
    <App />
  </PolyfireProvider>
);

reportWebVitals();
```

> 🚧 Replace _your_project_alias_
> 
> Make sure to remember to replace _your_project_alias_ in the provider by the Project Alias you can grab on your project page.

## 2. Add user sessions

For Polyfire to work client-side, you need to setup unique user sessions. That way, each user of your app will have a custom, rate-limited, API token and can use your app according to the restrictions you give them.

To do that you can use our login functions, from the _auth_ module.

In _**App.tsx**_ or wherever in your own app, add this authentification code:

```jsx
import React from 'react';
import { usePolyfire } from 'polyfire-js/hooks';

function App() {
  const { auth } = usePolyfire();
  const { login, status } = auth;

  if (status == 'unauthenticated')
    return <button onClick={() => login("github")}>Login With GitHub</button>
  else if (status == 'loading') return (<div>Loading...</div>)
  else if (status == 'authenticated') return (<div>We already logged in!</div>)
  else return <div />
}

export default App;
```

> If your app already has an integration with Firebase Auth, you can see how to use it [in that tutorial](doc:signin-firebase). We plan to add all the other Auth integrations, if you want us to speed up integrating the Auth system you are using, [message us on our Discord](www.polyfire.com/discord).

## 3. Use LLMs to write a poetic "Hello World"

Now that we have unique user sessions per user, we can make some calls to the Polyfire Backend API and run some AI models.

We will use the basic `generate()` function imported from the _models_ Polyfire module. By default `generate()` calls the OpenAI gpt-3.5-turbo endpoint, which is the model running ChatGPT.

Still in your **_App.tsx_** or wherever else you are in your app, modify your code so it looks like the one below:

```jsx
import React, { useState, useEffect } from "react";
import { usePolyfire } from "polyfire-js/hooks";

function App() {
  const { auth, models } = usePolyfire();
  const [helloWorld, setHelloWorld] = useState<string>();

  const { login, status } = auth;
  const { generate } = models;

  useEffect(() => {
    if (status === "authenticated") {
      generate("Write a hello world haiku").then(setHelloWorld);
    }
  }, [status]);

  if (status == "unauthenticated")
    return <button onClick={() => login("github")}>Login With GitHub</button>;
  else if (status == "loading" || !helloWorld) return <div>Loading...</div>;
  else if (status == "authenticated") return <div>{helloWorld}</div>;
  else return <div />;
}

export default App;
```

You can now start developing with the Polyfire Backend! :sparkles:
