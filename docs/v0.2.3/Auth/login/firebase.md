---
title: "Firebase"
slug: "firebase"
excerpt: ""
hidden: false
createdAt: "Mon Oct 16 2023 11:40:36 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:33:49 GMT+0000 (Coordinated Universal Time)"
---
## Add your Firebase Project ID to your project

Before being able to use firebase as a login method you first need to link your Firebase project to your polyfire project.

You can find your Firebase Project ID in your project settings in the firebase console <https://console.firebase.google.com/>. Choose your project, click on the gear icon in the top left corner and click on "Project Settings". Your Project ID will be displayed among other infos.

To link it to your Polyfire project, go on <https://beta.polyfire.com/> and choose your project. When you are in the project detail page, click on the Edit button and add your Firebase Project ID before saving.

## Setup the Firebase login

If you didn't do it already, follow this tutorial to setup the login with firebase: <https://firebase.google.com/docs/auth/web/start>

## Link your Firebase User Session to Polyfire

You can set the provider to firebase and send a firebase token to the login function parameter. To get a firebase token, you can use the `getIdToken()` method of the firebase user object.

For example:

```js Javascript
const userCredentials = await signInWithEmailAndPassword(
  auth,
  "john.doe@example.com",
  "correct_horse_battery_staple"
);

const user = userCredentials.user;

const firebaseToken = await user.getIdToken();

const polyfire = PolyfireClientBuilder({ project: "your_project_alias" })
await polyfire.auth.login({ provider: "firebase", token: firebaseToken })

// You can now use the Polyfire Client:
const helloWorldHaiku = await polyfire.generate("Write me a hello world haiku");

console.log(helloWorldHaiku);
```

> 📘 With the usePolyfire React Hook
> 
> Using the usePolyfire React Hook it would work the same except that you would be importing the _auth_ module from usePolyfire instead of creating a client object like higher up.
