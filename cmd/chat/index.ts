/* eslint-disable consistent-return */
import { exec } from "child_process";
import fs from "fs/promises";
import inquirer from "inquirer";
import { Stack } from "..";
import { generateEnvFile, sanitizeOptions } from "../utils";

const REACT_BOILERPLATE = "Vite     | React       | TypeScript | Styled Components";
const NEXT_BOILERPLATE = "Next.js  | React       | TypeScript | Styled Components";

const BOILERPLATES = {
    // inquirer choices
    [REACT_BOILERPLATE]: "https://github.com/polyfire-ai/polyfire-chat-react-boilerplate.git",
    [NEXT_BOILERPLATE]: "https://github.com/polyfire-ai/polyfire-chat-nextjs-boilerplate.git",

    // commander choices
    react: "https://github.com/polyfire-ai/polyfire-chat-react-boilerplate.git",
    nextjs: "https://github.com/polyfire-ai/polyfire-chat-nextjs-boilerplate.git",
};

type BoilerplateKey = keyof typeof BOILERPLATES;

const DEFAULT_SETTINGS = {
    BOT_NAME: "ChatBot",
    PROJECT: "",
    REPO_NAME: "polyfire-chat-template",
};

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

export default async function chat({
    stack,
    project,
    botname,
}: {
    stack?: Stack;
    project?: string;
    botname?: string;
}): Promise<boolean> {
    const questions = [
        {
            type: "list",
            name: "stack",
            message:
                "What stack would you like to use? (If you are not sure, please select the default option)",
            choices: Object.keys(BOILERPLATES).map((key) => key),
            when: () => !stack,
        },
        {
            type: "input",
            name: "name",
            message: "What is the name of the repository you wish to clone?",
            default: DEFAULT_SETTINGS.REPO_NAME,
        },
        {
            type: "input",
            name: "bot",
            message: "What name would you like to give to your bot?",
            default: DEFAULT_SETTINGS.BOT_NAME,
            when: () => !botname,
        },
        {
            type: "input",
            name: "project",
            message: "What is your project Alias ?",
            when: () => !project,
        },
    ];

    try {
        const answers = await inquirer.prompt(questions);
        const options = sanitizeOptions(answers);

        const defaultStack = stack || (options.stack as Stack);
        const defaultBotname = botname || options.bot;
        const defaultProject = project || options.project;

        const repoName = options.name || DEFAULT_SETTINGS.REPO_NAME;
        const repoURL = BOILERPLATES[defaultStack as BoilerplateKey];

        await cloneRepo(repoURL, repoName);

        generateEnvFile(repoName, defaultStack as Stack, defaultBotname, defaultProject);

        console.info(
            `You can now make "cd ${repoName} ; npm install ; npm run dev" to start the chatbot.`,
        );
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
    }

    return true;
}
