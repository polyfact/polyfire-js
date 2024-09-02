---
title: "Making ChatGPT"
slug: "chatgpt-clone"
excerpt: "In this tutorial, we will make a chatbot application similar to ChatGPT. We will use React as a frontend library, Tailwind as a CSS framework, and Polyfire's client SDK to access AI APIs and make the AI logic."
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Mon Sep 11 2023 09:22:11 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Oct 18 2023 20:57:45 GMT+0000 (Coordinated Universal Time)"
---
>  _**Note:** This tutorial uses the functions contained in the usePolyfire hook instead of the useChat directly. We thought it would be more interesting as a tutorial and you would learn more about Polyfire this way. If your goal is just to make a simple chat check the [useChat](doc:usechat) hook_

## Step 0: Getting started

This tutorial assume you already have made a **React project** using polyfire as explained in the Getting Started

## Step 1: Styling with TailwindCSS

For styling our chat interface, we'll be using TailwindCSS. Install it:

```bash
npm install -D tailwindcss
npx tailwindcss init
```

Then, set up your styles and configure Tailwind:

**src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
}
```

**tailwind.config.js**

```json
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Make sure to restart your server to apply the Tailwind styles.

## Step 2: Designing the Chat Interface

Time to design our chat interface:

Create a new ChatBox.tsx file and paste that code in it.

```jsx
function ChatBox() {
  return (
    <div className="flex flex-col items-center h-full py-2">
        <div className="border-black border border-solid p-4 mb-2 w-[800px] grow">
            <pre>
              <p><b>AI:</b> Hello World!</p>
            </pre>
        </div>
        <div className="flex w-[800px]">
            <div className="flex grow items-center border-black border border-solid">
                <div className="font-bold ml-4">Human:</div>
                <input className="p-1 my-2 mx-4 h-12 font-mono grow" placeholder="Type your message here !" />
            </div>
            <button className="bg-black text-white ml-2 p-2 px-5 font-mono font-bold">Send</button>
        </div>
    </div>
  );
}

export default ChatBox
```

Now, we want to import that ChatBot interface into our main App.  
Change your App.tsx so that it looks like the code below:

```jsx
function App() {
  const { auth: { login, status } } = usePolyfire();

  return (
    <div className="text-2xl font-bold p-2">
      {status === "unauthenticated" ? (
        <button onClick={() => login("github")}>
          Login with Github
        </button>
      ) : status === "authenticated" ? (
        <ChatBox />
      ) : (
        "Loading..."
      )}
    </div>
  );
}
```

Your interface should look like the screenshot below.  
Non dynamic chat

But we can't yet tap messages; we need to add the JavaScript logic in the ChatBox component to do that.  
This is done below:

```jsx
function ChatBox({ messages }: { messages: { is_user_message: boolean, content: string }[] }) {
  return (
    <div className="flex flex-col items-center h-full py-2">
        <div className="border-black border border-solid p-4 mb-2 w-[800px] grow">
            <pre>
                {messages.map(elem => (<div><b>{elem.is_user_message ? "Human:" : "AI:"}</b> <span>{elem.content}</span></div>))}
            </pre>
        </div>
        <div className="flex w-[800px]">
            <div className="flex grow items-center border-black border border-solid">
                <div className="font-bold ml-4">Human:</div>
                <input className="p-1 my-2 mx-4 h-12 font-mono grow" placeholder="Type your message here !" />
            </div>
            <button className="bg-black text-white ml-2 p-2 px-5 font-mono font-bold">Send</button>
        </div>
    </div>
  );
}

export default ChatBox
```

This should give you an error; don't worry about it, and go directly to the next step.

Next, we enhance our ChatBox by introducing the callback property onMessage to handle user message submissions. For this, we need to import the FormEvent type from React. Update your ChatBox.tsx:

```jsx
import { useState, FormEvent } from "react";

function ChatBox({ messages, onMessage }: { messages: { is_user_message: boolean, content: string }[], onMessage: (message: string) => Promise<void> | void }) {
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();

      setLoading(true);
      const message = (e.target as any).message.value;
      if (message) {
        (e.target as any).message.value = "";
        await onMessage(message);
      }
      setLoading(false);
  }

  return (
    <div className="flex flex-col items-center h-full py-2">
        <div className="border-black border border-solid p-4 mb-2 w-[800px] grow overflow-y-scroll">
            <pre>
                {messages.map(elem => (<p className="whitespace-pre-wrap"><b>{elem.is_user_message ? "Human:" : "AI:"}</b> {elem.content}</p>))}
            </pre>
        </div>
        <form onSubmit={handleSubmit} className="flex w-[800px]">
            <div className="flex grow items-center border-black border border-solid">
                <div className="font-bold ml-4">Human:</div>
                <input className="p-1 my-2 mx-4 h-12 font-mono grow" placeholder="Type your message here !" name="message" />
            </div>
            <input className="cursor-pointer bg-black text-white ml-2 p-2 px-5 font-mono font-bold" value={loading ? "Loading..." : "Send >"} type="submit" disabled={loading} />
        </form>
    </div>
  );
}

export default ChatBox
```

## Step 3: Implementing the Chat Logic

To make that preceding Chat Logic work, we need to update our App.tsx, and work with the Polyfire API to generate chat messages.

We will make a chat and display a chat history of the conversation.  
Let's update our App component so it looks something like this:

```jsx
function App() {
  const { auth: { login, status }, utils: { Chat } } = usePolyfire();
  const [chat, setChat] = useState<Chat>();
  const [messages, setMessages] = useState<{ is_user_message: boolean, content: string }[]>([]);

  useEffect(() => {
      if (status === "authenticated") {
          setChat(new Chat());
      }
  }, [status]);

  return (
    <>{
      status === "unauthenticated" ? (<button onClick={() => login("github")}>Login with Github</button>)
      : chat ? <ChatBox messages={messages} onMessage={async (message) => {
          await chat.sendMessage(message);
          setMessages((await chat.getMessages()).reverse());
      }} />
      : "Loading..."
    }</>
  );
}

```

Try typing a question! You should get an answer from GPT-3.5, the default PolyFire AI model.  
Your interface should look something like the one below.  
final app.

And there you have it! You've successfully created a simple chat application similar to ChatGPT using React and Polyfire. Enjoy chatting!
