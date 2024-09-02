---
title: "OAuth Providers"
slug: "login-with-providers"
excerpt: ""
hidden: false
createdAt: "Wed Sep 27 2023 07:17:47 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:41:44 GMT+0000 (Coordinated Universal Time)"
---
For Polyfire to work client-side, **you need to setup unique user sessions**. That way, each user of your app will have a custom, rate-limited, API token and can use your app according to the restrictions you give them.

To do that you can use our login functions, from the _auth_ module. 

```jsx
import React from 'react';  
import { usePolyfire } from 'polyfire-js/hooks';

function App() {  
  const { auth } = usePolyfire();
  const { login, status } = auth;
  
  if (status == 'loading') {
    return (
      <div>Loading...</div>
    )
  } else if (status == 'authenticated') {
    return (
      <div>We already logged in!</div>
    )
  } else if (status == 'unauthenticated') {
    return (
      <button onClick={() => login("github")}>Login With GitHub</button>
    )
  } else {
    return <div />
  }
}

export default App;
```

# Linking pre-existing auth system

If you have Firebase Auth setup. Pass in your JWT as shown [in that tutorial](doc:signin-firebase). If you want integrations to other auth providers:[message us on our Discord](https://www.polyfire.com/discord).

You can also connect your own auth system [by doing a custom auth.](doc:custom-authentification-system)

# Providers Available

The sign in providers available are GitHub, Google, Microsoft (Azure) and Firebase (passing your Firebase JWT).

[Reach out on Discord if you want more.](discord.polyfire.com)
