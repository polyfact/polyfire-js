import { program } from "commander";
import inquirer from "inquirer";
import chat from "./chat";
import agent from "./agent";

const knownCommands = ["chat", "agent"];
const knownStacks = ["react", "nextjs"];

export type Stack = (typeof knownStacks)[number];

type Command = (typeof knownCommands)[number];

type ChatOptions = {
    stack?: Stack;
    project?: string;
    botname?: string;
};

type AgentOptions = {
    project?: string;
};

type Options<T extends Command | undefined> = T extends "chat"
    ? ChatOptions
    : T extends "agent"
    ? AgentOptions
    : never;

async function promptUser<T extends Command | undefined>(
    type?: T,
    options?: Options<T>,
): Promise<void> {
    if (type === "chat") {
        if (options && "stack" in options && !knownStacks.includes(options.stack as Stack)) {
            console.error("Invalid stack option. Please choose between react and nextjs.");
            return;
        }

        if (options) {
            await chat(options as ChatOptions);
            return;
        }
    } else if (type === "agent" && options) {
        await agent(options as AgentOptions);
        return;
    }

    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "appType",
            message: "What do you want to build?",
            choices: ["Create chatbot", "Create agent", "Quit"],
            when: () => !type,
        },
    ]);

    switch (answer.appType) {
        case "Create chatbot":
            await chat(options as ChatOptions);
            break;
        case "Create agent":
            await agent(options as AgentOptions);
            break;
        case "Quit":
            console.info("Bye!");
            return;
        default:
            console.log("Invalid choice");
            break;
    }
}

const paramsNumber = process.argv.length - 2;

if (paramsNumber === 0) {
    promptUser("", undefined);
} else {
    program
        .command("chat")
        .description("Create a new chatbot")
        .option("--stack <stack>", "The tech stack to use")
        .option("--project <project>", "The project name")
        .option("--botname <botname>", "The name of the bot")
        .action((options) => {
            promptUser("chat", options);
        });

    program
        .command("agent")
        .description("Create a new chatbot")
        .option("--project <project>", "The project name")
        .action((options) => {
            promptUser("agent", options);
        });

    program.parse(process.argv);
}
