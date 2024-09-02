---
title: "useAgent"
slug: "useagent-react-hook-1"
excerpt: "The `useAgent` hook is a Agent AI tool for simulating the cognitive steps someone might take when answering a question."
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Sep 12 2023 13:59:46 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Mon Oct 23 2023 11:12:28 GMT+0000 (Coordinated Universal Time)"
---
## Importing the Hook

To use the `useAgent` hook, first, ensure that it's imported into your React component.

```javascript
import { useAgent } from 'polyfire-js/hooks;
```

## Actions

To enable the agent to perform specific tasks, you need to define the `actions` that the agent will use. Each action is represented as an object with a `name`, `description`, `callback`, and `example`, all are required.

The action type is:

```ts Typescript
{
  name: string, // Action name 
  description: string, // Description of what the action does 
  callback: (param: string) => Promise<string | undefined>, // This is the function that'll be executed for this action
  example: {
    question: string,
     process: [
      {
        thought: string,
        action: string,
        observation: string,
      }
    ]
  }
}
```

### Writing the Examples

Each action will need to have some examples of how it is used. This is necessary for the LLM to understand what the action actually does.

For example, a basic search function that allows the Agent to search on the web could have these examples:

```json JSON
[
  {
    question:
      'Musician and satirist Allie Goertz wrote a song about the "The Simpsons" character Milhouse, who Matt Groening named after who?',
    process: [
      {
        thought:
          'The question simplifies to "The Simpsons" character Milhouse is named after who. I only need to search Milhouse and find who it is named after.',
        action: "Search[Milhouse]",
        observation:
          "Milhouse Mussolini Van Houten is a recurring character in the Fox animated television series The Simpsons voiced by Pamela Hayden and created by Matt Groening.",
      },
      {
        thought:
          'The paragraph does not tell who Milhouse is named after, maybe I can look up "The Simpsons Milhouse named after".',
        action: "Search[The Simpsons Milhouse named after]",
        observation:
          "Milhouse was named after U.S. president Richard Nixon, whose middle name was Milhous.",
      },
      {
        thought:
          "Milhouse was named after U.S. president Richard Nixon, so the answer is Richard Nixon.",
        action: "Finish[Richard Nixon]",
        observation: "",
      },
    ],
  }
]
```

## UseAgent

Now that we have the actions defined, we can call useAgent with the action list. The second parameter is a `GenerationOptions` as defined in [generate](ref:generate)

> **NOTE:**
>
> In our tests, the agents were not working correctly if we didn't use GPT-4. Using GPT-3.5 will make them hallucinate or forget actions as well as getting stuck in endless loops.
>
> You can still test it with other models but you've been warned.

```js
const { start, stop } = useAgent(actions, {
    model: "gpt-4",
    provider: "openai",
});
```

### Start the agent

After the agent has been initialized with all its action, you can use the `start` function to give it a task to accomplish.

```
function start(question: string, progress?: (step: number, result: string) => void): Promise<string>
```

If you want to log/use the reasoning of the agent, you can use the progress function.

If you want to stop the agent early you can call the function `stop()`.

## Example Usage

Here's how you might use the `useAgent` hook in a component:

```javascript
import { useState } from "react";
import { usePolyfire, useAgent, DefinitionAction } from "polyfire-js/hooks";

export const examples = [
  {
    question:
      'Musician and satirist Allie Goertz wrote a song about the "The Simpsons" character Milhouse, who Matt Groening named after who?',
    process: [
      {
        thought:
          'The question simplifies to "The Simpsons" character Milhouse is named after who. I only need to search Milhouse and find who it is named after.',
        action: "Search[Milhouse]",
        observation:
          "Milhouse Mussolini Van Houten is a recurring character in the Fox animated television series The Simpsons voiced by Pamela Hayden and created by Matt Groening.",
      },
      {
        thought:
          'The paragraph does not tell who Milhouse is named after, maybe I can look up "The Simpsons Milhouse named after".',
        action: "Search[The Simpsons Milhouse named after]",
        observation:
          "Milhouse was named after U.S. president Richard Nixon, whose middle name was Milhous.",
      },
      {
        thought:
          "Milhouse was named after U.S. president Richard Nixon, so the answer is Richard Nixon.",
        action: "Finish[Richard Nixon]",
        observation: "",
      },
    ],
  }
];


export default function App() {
  const { auth: { login }, models } = usePolyfire();

  const search = async (request: string) => {
    const page = await models?.generate(request, {
      web: true,
    });

    return page;
  };


  const actions: DefinitionAction[] = [
    {
      name: "Search",
      description: "Use this action if you have to search on the web",
      callback: search,
      example: examples[0],
    }
  ];

  const { start, stop } = useAgent(actions, {
    provider: "openai",
    model: "gpt-4",
  });

  const [answer, setAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState("idle"); // 'idle', 'processing', 'completed'

  const getAnswer = async () => {
    setStatus("processing");

    try {
      const response = await start(
        "How is jean-baptiste dutrou-bordier ?",
        (step, result) => {
          console.log(`Step: ${step}, Result: ${result}`);
        }
      );

      setAnswer(response);
      setStatus("completed");
    } catch (error) {
      console.error("An error occurred:", error);
      setStatus("idle");
    }
  };

  const loginButton = login && (
    <button onClick={() => login({ provider: "google" })} className="login-btn">
      Login with Google
    </button>
  );

  const agentBox = (
    <div>
      <button onClick={getAnswer}>Get Answer</button>
      {status === "processing" && <p>Processing...</p>}
      {status === "completed" && answer && <p>Answer: {answer}</p>}
      <button onClick={stop}>Stop</button>
    </div>
  );

  return <div>{login ? loginButton : agentBox}</div>;
}


```
