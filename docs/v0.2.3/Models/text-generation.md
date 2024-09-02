---
title: "Text Generation"
slug: "text-generation"
excerpt: "Examples of text generation functions."
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Fri Nov 03 2023 01:00:22 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Nov 03 2023 02:14:19 GMT+0000 (Coordinated Universal Time)"
---
# Generate Text

The basic LLM function is called `generate()`. It is imported from the _models_ Polyfire module. By default `generate()` calls the OpenAI gpt-3.5-turbo endpoint, which is the model running ChatGPT.

An example of a simple AI-generated greeting in a React app: 

```jsx
function GreetingBox({ userName }) {
  const [greeting, setGreeting] = useState();
  const { models } = usePolyfire();

  useEffect(() => {
      models
        .generate(`Write a fun and simple greeting for ${userName}`)
        .then(setGreeting);
  }, []);

  return <div>{greeting}</div>;
}
```

# Customizing the Model

You can change the the model the `generate()` function calls by including the options object. The complete list of available models and their names can be found [here](doc:models-list) or on the Dashboard. 

The same example but using GPT-4:

```jsx JSX
function GreetingBox({ userName }) {
  const [greeting, setGreeting] = useState();
  const { models } = usePolyfire();

  useEffect(() => {
    models
      .generate(`Write a fun and simple greeting for ${userName}`, { model: "gpt-4" })
      .then(setGreeting);
  }, []);

  return <div>{greeting}</div>;
}
```

# Uncensored Generation

To generate uncensored text, call the model `wizard-mega-13b-awq`. It can be very handy if you are trying to build, let's say, an AI girlfriend.

```jsx
function DirtyAnswer({ userMessage, girlfriendPrompt }) {
  const [dirtyTalk, setDirtyTalk] = useState();
  const { models } = usePolyfire();

  useEffect(() => {
    const prompt = `${girlfriendPrompt}. Write a dirty answer to this message: ${userMessage}.`
    
    models
      .generate(prompt, { model: "wizard-mega-13b-awq" })
      .then(setDirtyTalk);
  }, []);

  return <div>{dirtyTalk}</div>;
}
```
