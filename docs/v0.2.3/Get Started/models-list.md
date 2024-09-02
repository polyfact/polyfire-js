---
title: "Models List"
slug: "models-list"
excerpt: "List of the models available and their respective costs."
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Sep 26 2023 01:24:16 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Nov 10 2023 10:06:56 GMT+0000 (Coordinated Universal Time)"
---
| Model Name                         | Type                       | Input               | Output              |
| :--------------------------------- | :------------------------- | :------------------ | :------------------ |
| `gpt-3.5-turbo`                    | Text Generation            | $0.0015 / 1K tokens | $0.002 / 1K tokens  |
| `gpt-3.5-turbo-16k`                | Text Generation            | $0.0030 / 1K tokens | $0.004 / 1K  tokens |
| `gpt-4`                            | Text Generation            | $0.03 / 1K tokens   | $0.06 / 1K tokens   |
| `gpt-4-32k`                        | Text Generation            | $0.06 / 1K tokens   | $0.12 / 1K tokens   |
| `cohere`                           | Text Generation            | $0.015 / 1K tokens  | $0.015 / 1K tokens  |
| `llama-2-70b-chat`[Replicate]      | Text Generation            | N/A                 | $0.0014 / second    |
| `wizard-mega-13b-awq`[Replicate]   | Uncensored Text Generation | N/A                 | $0.000725 / second  |
| `airoboros-llama-2-70b`[Replicate] | Uncensored Text Generation | N/A                 | $0.0014 / second    |
| `replit-code-v1-3b`[Replicate]     | Code Generation            | N/A                 | $0.00115 / second   |
| `dalle-2`                          | Image Generation           | N/A                 | $0.02 / image       |
| `text-embedding-ada-002`           | Embeddings                 | $0.0001 / 1K tokens | N/A                 |
| `elevenlabs`                       | Text-To-Speech             | $0.3 / 1K chars     | N/A                 |
| `whisper`                          | Speech-To-Text             | $0.0001 / second    | N/A                 |

- You can put your own OpenAI and Replicate keys in the [dashboard settings](https://beta.polyfire.com/settings).
- `text-embedding-ada-002` is used when creating a Memory/Embeddings or when using a DataLoader.
- Some features (Web, Memory, Embeddings, DataLoaders, etc...) will increase the number of input tokens.  [the infos method](ref:infos) lets you monitor closely the LLMs token usage.
- Your total usage costs appears on [your dashboard](https://beta.polyfire.com)
