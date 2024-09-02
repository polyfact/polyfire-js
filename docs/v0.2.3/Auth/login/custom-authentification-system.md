---
title: "Custom Authentification System"
slug: "custom-authentification-system"
excerpt: ""
hidden: false
createdAt: "Mon Oct 16 2023 11:41:24 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:33:49 GMT+0000 (Coordinated Universal Time)"
---
If you are already using a custom authentification system and  want to link Polyfire to your authentification system, you can use the "custom" provider.

You will need to sign a Json Web Token using the RSA/RS256 algorithm and input your public key in the PEM format in the dashboard in the "Custom Auth Public Key" field of your project's settings.

Your JWT must contains these fields: 

- `iss`: Your project alias
- `aud`:  must be:`polyfire_custom_auth_api`
- `sub`: The id of the user you want to identify. It can be any string as long as it is unique to the user.

For example. Assuming the public key is already added in the dashboard "Custom Auth Public Key" field, somewhere in server-side code:

```js Javascript

const token = jwt.sign(
  {
    iss: projectAlias,
    aud: "polyfire_custom_auth_api", // Don't change this string
    sub: userID,
  },
  privateKey, // Leaking this key would allow to connect as any user. Make sure it's never sent client-side.
  { algorithm: "RS256" }
);
```

The generated token can then be used client-side in the login function like this:

```js Javascript
login({ provider: "custom", token: theTokenGeneratedBefore })
```
