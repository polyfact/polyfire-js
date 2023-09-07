<h1 align="center">🏭 PolyFact</h1>

<h4 align="center">
    <a href="https://github.com/polyfact/polyfact-node/wiki">Documentation</a> |
    <a href="https://github.com/polyfact/awesome-polyfact">Awesome list</a> |
    <a href="https://discord.gg/8mkBfDXNTM">Discord</a>
</h4>

<p align="center">⚡ A lightweight and simple way to create tools using AI 🪶</p>

PolyFact's goal is to make it possible to code every AI tool/Chatbot you could want in only a couple of lines of code without the need for complex abstractions and having to deploy anything.

<p align="center"><img src="demo.gif" /></p>

## ✨ Features
- **[Generate](https://github.com/polyfact/polyfact-node/wiki/Generate-Text)**: Answer to simple requests as text
- **[Chat](https://github.com/polyfact/polyfact-node/wiki/Create-chatbots)**: Easily create chatbots
- **[Transcribe](https://github.com/polyfact/polyfact-node/wiki/Transcribe-audio-files)**: Transcribe audio files to text
- **[Memory](https://github.com/polyfact/polyfact-node/wiki/Long-term-Memory-and-Embeddings)**: Easily create a long-term memory and simplify the use of large amounts of information
- **[Type checked generation](https://github.com/polyfact/polyfact-node/wiki/Generate-objects-following-a-type)**: Answer simple requests with a type you defined *(🎲 probabilistic function)*
- **[Image generation](https://github.com/polyfact/polyfact-node/wiki/Generate-images)**: Generate images with Dall-E and Midjourney
- **[Usable without a backend from React](https://github.com/polyfact/polyfact-node/wiki/Using-Polyfact-in-React)**: The usePolyfact hooks lets you use Polyfact and handle authentification without having to deploy any backend

## 📚 Documentation

You can consult PolyFact's documentation at https://github.com/polyfact/polyfact-node/wiki

We also made a couple of tutorials you can use to get started with Polyfact:
- **[Tutorial: How to make a clone of ChatGPT](https://github.com/polyfact/polyfact-node/wiki/Tutorial:-How-to-make-a-clone-of-ChatGPT)**
- **[Tutorial: Add payment to your polyfact app with stripe subscriptions](https://github.com/polyfact/polyfact-node/wiki/Tutorial:-Add-stripe-subscriptions)**

## 🚀 Getting started

To install polyfact into your repository:

```bash
npm install polyfact
```

Get your polyfact token by signing up with GitHub here: https://app.polyfact.com<br/>
Add your PolyFact Token in the `POLYFACT_TOKEN` environment variable:

```bash
export POLYFACT_TOKEN= # The token displayed on https://app.polyfact.com
```

### 💡 Examples

There are more examples and tutorials in the [Documentation](https://github.com/polyfact/polyfact-node/wiki) but here's a simple chatbot to get you started:

```js
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Chat } from "polyfact";

// We use the nodeJS readline API to extract the user inputs from the standard input of the terminal
// It can be change to whatever interface you want the user to interact with, readline is just for
// the example. 
const rl = readline.createInterface({ input, output });

async function chatREPL() {
    // We initialize a new polyfact chat
    const chat = new Chat();

    while (true) {
        // We retrieve the userInput from the nodeJS readline API
        const userInput = await rl.question("> ");

        // We get an answer from the polyfact API to the message the user sent
        const aiAnswer = await chat.sendMessage(userInput);

        // And we print it to the standard output
        console.log(aiAnswer);
    }
}

chatREPL()
```

## 📫 Contact us

We strive for feedback and want to understand everyone's needs, and you can hang out with us on [Discord](https://discord.gg/8mkBfDXNTM)!

## 🧑‍💻 Contributing

PolyFact is open-source! You can contribute to this package or the [API](https://github.com/polyfact/polyfact-api-go) by opening an issue or a PR!
