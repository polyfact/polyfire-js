import { generateWithType, splitString } from "../lib/index";
import * as t from "io-ts";

(async () => {
    // console.log(await generateWithType("Count from 1 to 5", t.type({ result: t.array(t.number) })));
    console.log(
        JSON.stringify(
            splitString(
                "What is tiktoken? and What is Tokenization?\n\nTiktoken is an open-source tool developed by OpenAI that is utilized for tokenizing text.\n\nTokenization is when you split a text string to a list of tokens. Tokens can be letters, words or grouping of words (depending on the text language).\n\nFor example, “I’m playing with AI models” can be transformed to this list [“I”,”’m”,” playing”,” with”,” AI”,” models”].\n\nThen these tokens can be encoded in integers.\n\nIn fact, this example demonstrates the functionality of the “tiktoken” library.\n\nBefore using any NLP models, you need to tokenize your dataset to be processed by the model.\n\nFurthermore, OpenAI uses a technique called byte pair encoding (BPE) for tokenization. BPE is a data compression algorithm that replaces the most frequent pairs of bytes in a text with a single byte. This reduces the size of the text and makes it easier to process.\nWhy use tiktoken?\n\nYou can use tiktoken to count tokens, because:\n\n    You need to know whether the text your are using is very long to be processed by the model\n    You need to have an idea about OpenAI API call costs (The price is applied by token).\n\n    For example, if you are using GPT-3.5-turbo model you will be charged: $0.002 / 1K tokens\n\n    You can play with it here in OpenAI platform: https://platform.openai.com/tokenizer\n\nHow to count the number of tokens using tiktoken?\nInstall and Import\n\nFirst you need to install it:\n\npip install tiktoken\n\nThen you import the library and start using it:\n\nimport tiktoken\n\nEncoding\n\nDifferent encodings are used in openai: cl100k_base, p50k_base, gpt2.\n\nThese encodings depend on the model you are using:\n\nFor gpt-4, gpt-3.5-turbo, text-embedding-ada-002, you need to use cl100k_base.\n\nAll this information is already included in OpenAI API, you don’t need to remember it. Therefore, you can call the encoding using 2 methods:\n\n",
                100,
            ),
        ),
    );
})();
