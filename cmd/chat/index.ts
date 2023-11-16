/* eslint-disable consistent-return */
import inquirer from "inquirer";
import { Stack } from "..";
import { cloneRepo, generateEnvFile, sanitizeOptions } from "../utils";

const BOILERPLATES = {
    react: "https://github.com/polyfire-ai/polyfire-chat-react-boilerplate.git",
    nextjs: "https://github.com/polyfire-ai/polyfire-chat-nextjs-boilerplate.git",
};

type BoilerplateKey = keyof typeof BOILERPLATES;

const DEFAULT_SETTINGS = {
    BOT_NAME: "ChatBot",
    PROJECT: "",
    REPO_NAME: "polyfire-chat-template",
};

export default async function chat(options: {
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
            choices: ["react", "nextjs"],
            when: () => !options?.stack,
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
            when: () => !options?.botname,
        },
        {
            type: "input",
            name: "project",
            message: "What is your project Alias ?",
            when: () => !options?.project,
        },
    ];

    try {
        const answers = await inquirer.prompt(questions);
        const inquirerOptions = sanitizeOptions(answers);

        const defaultStack = (options?.stack || inquirerOptions?.stack) as Stack;
        const defaultBotname = options?.botname || inquirerOptions?.bot;
        const defaultProject = options?.project || inquirerOptions?.project;

        const repoName = inquirerOptions?.name || DEFAULT_SETTINGS.REPO_NAME;
        const repoURL = BOILERPLATES[defaultStack as BoilerplateKey];

        await cloneRepo(repoURL, repoName);

        generateEnvFile(repoName, defaultStack, defaultBotname, defaultProject);

        console.info(
            `You can now make "cd ${repoName} ; npm install ; npm run dev" to start the chatbot.`,
        );
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
    }

    return true;
}
