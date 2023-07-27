<h1 align="center">🏭 Polyfact</h1>

<h4 align="center">
    <a href="https://github.com/polyfact/polyfact-node/wiki">Documentation</a> |
    <a href="https://github.com/polyfact/awesome-polyfact">Awesome list</a> |
    <a href="https://discord.gg/8mkBfDXNTM">Discord</a>
</h4>

<p align="center">⚡ A lightweight and simple way to create tools using AI 🪶</p>

Polyfact's goal is to make it possible to code every AI tool/Chatbot you could want in only a couple of lines of code without the need for complex abstractions and to have to deploy anything.

<p align="center"><img src="demo.gif" /></p>

## ✨ Features
- **[Generate](https://github.com/polyfact/polyfact-node/wiki/generate)**: Answer to simple requests as text
- **[Chat](https://github.com/polyfact/polyfact-node/wiki/chat)**: Easily create chatbots
- **[Transcribe](https://github.com/polyfact/polyfact-node/wiki/transcribe)**: Transcribe audio files to text
- **[Memory](https://github.com/polyfact/polyfact-node/wiki/memory)**: Easily create a long term memory and simplify use of large amount of information
- **[Type checked generation](https://github.com/polyfact/polyfact-node/wiki/generateWithType)**: Answer simple requests with a type you defined *(🎲 probabilistic function)*

## 📚 Documentation

You can consult Polyfact's documentation at https://github.com/polyfact/polyfact-node/wiki

## 🚀 Getting started

To install polyfact into your repository:

```bash
npm install polyfact
```

Get your your polyfact token by signing up with github here: https://app.polyfact.com<br/>
Add your Polyfact Token in the `POLYFACT_TOKEN` environment variable:

```bash
export POLYFACT_TOKEN= # The token displayed on https://app.polyfact.com
```

### 💡 Examples

There's more examples and tutorials in the [Documentation](https://github.com/polyfact/polyfact-node/wiki) but here's a simple chatbot to get you started:

```js
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Chat } from "polyfact";

const rl = readline.createInterface({ input, output });

async function chatREPL() {
    const chat = new Chat();

    while (true) {
        const userInput = await rl.question("> ");

        console.log(await chat.sendMessage(userInput));
    }
}

chatREPL()
```

## 📫 Contact us

We are striving for feedbacks and want to understand everyone's needs, you can hang out with us on [Discord](https://discord.gg/8mkBfDXNTM) !

## 🧑‍💻 Contributing

Polyfact is opensource ! You can contribute to this package or to the [API](https://github.com/polyfact/polyfact-api-go) by opening an issue or a PR !
