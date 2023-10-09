/* eslint-disable consistent-return */
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import inquirer from "inquirer";
import { generate } from "../../lib/generate";

const REACT_BOILERPLATE = "Vite     | React       | TypeScript | Styled Components";
const NEXT_BOILERPLATE = "Next.js  | React       | TypeScript | Styled Components";

const BOILERPLATES = {
    [REACT_BOILERPLATE]: "https://github.com/kevin-btc/polyfire-chat-template.git",
    [NEXT_BOILERPLATE]: "https://github.com/kevin-btc/polyfire-chat-nextjs-boilerplate.git",
};

type BoilerplateKey = keyof typeof BOILERPLATES;

const DEFAULT_SETTINGS = {
    PROMPT_ID: "49735ec7-6c20-4ceb-9741-3de1db4fe6cd",
    REPO_NAME: "polyfire-chat-template",
    TOPIC: "Love, Amour, Heart, Kiss, Valen",
};

function sanitizeInput(input: string): string {
    return input.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function sanitizeOptions(options: Record<string, string>): Record<string, string> {
    const keysToSkip = ["stack"];
    return Object.fromEntries(
        Object.entries(options).map(([key, value]) => [
            key,
            keysToSkip.includes(key) || typeof value !== "string" ? value : sanitizeInput(value),
        ]),
    );
}

function extractConfig(data: string) {
    const startIndex = data.indexOf("{");
    if (startIndex === -1) {
        throw new Error("First '{' not found.");
    }

    data = data.substring(startIndex);

    const lastIndex = data.lastIndexOf("}");
    if (lastIndex === -1) {
        throw new Error("Last '}' not found.");
    }

    data = data.substring(0, lastIndex + 1);

    return data;
}

async function cloneRepo(repoURL: string, repo: string): Promise<void> {
    if (
        await fs.access(repo).then(
            () => true,
            () => false,
        )
    ) {
        console.log("Repository already exists. No action taken.");
        process.exit(0);
    }

    return new Promise((resolve, reject) => {
        exec(`git clone ${repoURL} ${repo}`, (error) => {
            if (error) reject(`Error cloning the repository: ${error}`);
            console.log("Repository cloned successfully.");
            resolve();
        });
    });
}

const defaultConfig = {
    header: {
        logo: "./logo.svg",
        bgColor: "#2D3748",
        textColor: "#E2E8F0",
    },
    chat: {
        chatBackgroundColor: "rgba(111, 111, 111, 0.1)",
        chatTextColor: "#2D3748",
        inputBackgroundColor: "#E2E8F0",
        inputColor: "#2D3748",
        placeholderTextColor: "#A0AEC0",
        botMessageColor: "#2D3748",
        botMessageBackgroundColor: "rgba(220, 242, 247)",
        userMessageColor: "#E2E8F0",
        userMessageBackgroundColor: "#4A5568",
        botName: "ChatBot",
        buttonBackgroundColor: "#4A5568",
        buttonBorderColor: "#2D3748",
        buttonBorderWidth: "1px",
        dotsColor: "#A0AEC0",
        promptId: "feea76f3-af40-4df9-be47-ad073d504615",
        memoryId: "",
    },
    footer: {
        bgColor: "#2D3748",
        textColor: "#E2E8F0",
    },
};

function formatPrompt(options: Record<string, string>): string {
    return `
    From this short description:
    "${options?.topic}"

    Detect the topic from the above description and generate a theme with relevant and complementary colors and adding the colors in this object:
    const config: Config = ${JSON.stringify(defaultConfig, null, 4)};

    "chatBackgroundColor" must be the same color as "botMessageBackgroundColor" but with a few opacity.
    However each color must be a complementary color but unique.

    Answer only the object as if you were logging this command: \`console.log(JSON.parse(config))\`.

    Assistant: Sure! Here is the theme in the config object:
    `;
}

async function generateTheme(options: Record<string, string>, token: string): Promise<string> {
    console.log("Generating a theme for the chatbot...");

    const prompt = formatPrompt(options);
    const { result } = await generate(
        prompt,
        { model: "gpt-4", provider: "openai", infos: true, stream: false },
        { token, endpoint: "https://api2.polyfire.com" },
    ).catch((e) => {
        throw new Error(`Error during OpenAI request: ${e.message}`);
    });

    return result;
}

async function updateConfig(repo: string, res: string): Promise<void> {
    const filePath = path.join(repo, "src/config.ts");
    const data = await fs.readFile(filePath, "utf8");
    const updatedContent = data.replace(
        /\/\/ \[start\](.*?)\[end\]/gs,
        `const config: Config = ${extractConfig(res)}`,
    );

    await fs.writeFile(filePath, updatedContent, "utf8");
    console.log("Config file updated successfully with the new theme!");
}

export default async function chat(token: string): Promise<boolean> {
    const questions = [
        {
            type: "list",
            name: "testBoilerplate",
            message: "Would you like to test the boilerplate with predefined settings?",
            choices: ["Yes", "No"],
            default: "No",
        },

        {
            type: "list",
            name: "stack",
            message:
                "What stack would you like to use? (If you are not sure, please select the default option)",
            choices: Object.keys(BOILERPLATES).map((key) => key),
            default: BOILERPLATES[REACT_BOILERPLATE],
            when: (answers: { testBoilerplate: string }) => answers.testBoilerplate === "No",
        },
        {
            type: "list",
            name: "style",
            message:
                "Would you like to use a preset style or generate custom style based on a specific topic using LLMs ?",
            choices: ["Preset", "Custom"],
            default: "Custom",
            when: (answers: { testBoilerplate: string }) => answers.testBoilerplate === "No",
        },
        {
            type: "input",
            name: "topic",
            message: "Provide your custom topic to create a unique theme:",
            when: (answers: { [key: string]: string }) =>
                answers.testBoilerplate === "No" && answers.style === "Custom",
        },
        {
            type: "input",
            name: "token",
            message: "Please provide your POLYFACT_TOKEN:",
            default: process.env.POLYFACT_TOKEN,
            when: (answers: { [key: string]: string }) =>
                answers.testBoilerplate === "No" && answers.style === "Custom" && !token,
        },
        {
            type: "input",
            name: "name",
            message: "What is the name of the repository you wish to clone?",
            default: "polyfire-chat-template",
            when: (answers: { testBoilerplate: string }) => answers.testBoilerplate === "No",
        },
        {
            type: "input",
            name: "bot",
            message: "What name would you like to give to your bot?",
            default: "ChatBot",
            when: (answers: { testBoilerplate: string }) => answers.testBoilerplate === "No",
        },
        {
            type: "input",
            name: "memory",
            message: "If applicable, provide the ID of the memory:",
            when: (answers: { testBoilerplate: string }) => answers.testBoilerplate === "No",
        },
        {
            type: "input",
            name: "prompt",
            message: "If you wish to load a shared prompt, please provide the System Prompt ID:",
            when: (answers: { testBoilerplate: string }) => answers.testBoilerplate === "No",
        },
    ];
    try {
        const answers = await inquirer.prompt(questions);
        const options = sanitizeOptions(answers);

        if (!token) throw new Error("POLYFACT_TOKEN is required.");

        if (answers.testBoilerplate === "Yes") {
            Object.assign(options, {
                prompt: DEFAULT_SETTINGS.PROMPT_ID,
                topic: DEFAULT_SETTINGS.TOPIC,
                name: "seraphina-bot",
                bot: "Seraphina",
            });
        }

        const repoName = options.name || DEFAULT_SETTINGS.REPO_NAME;
        const boilerplate = BOILERPLATES[options.stack as BoilerplateKey];

        const repoURL =
            options.testBoilerplate === "Yes" ? BOILERPLATES[REACT_BOILERPLATE] : boilerplate;

        await cloneRepo(repoURL, repoName);

        const themeData =
            options.topic || options.testBoilerplate === "Yes"
                ? await generateTheme(options, token)
                : `const config: Config = ${JSON.stringify(defaultConfig, null, 4)};`;

        await updateConfig(repoName, themeData);

        console.info(
            `You can now make "cd ${repoName} ; npm install ; npm run dev" to start the chatbot.`,
        );
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
    }

    return true;
}
