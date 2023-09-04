// eslint-disable-next-line import/no-extraneous-dependencies
import inquirer from "inquirer";
import docs from "./docs";
import chat from "./chat";
import prompt from "./prompt";

let token: string;

async function promptUser(initial = true) {
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "token",
            message: "Please provide your POLYFACT_TOKEN:",
            validate: (value: string) => (value ? true : "POLYFACT_TOKEN is a mandatory field."),
            default: process.env.POLYFACT_TOKEN,
            when: initial,
        },
        {
            type: "list",
            name: "appType",
            message: "What do you want to build?",
            choices: ["Create chatbot", "Manage prompt", "Create agent", "Quit"],
        },
    ]);

    if (initial) token = answer.token;

    switch (answer.appType) {
        case "Create chatbot":
            while (await chat(token));
            promptUser(false);
            break;

        case "Manage prompt":
            while (await prompt(token));
            promptUser(false);
            break;

        case "Create docs":
            docs();
            break;
        case "Create agent":
            console.info("Not implemented yet");
            break;
        case "Quit":
            console.info("Bye!");
            return;
        default:
            console.log("Invalid choice");
            break;
    }
}

promptUser();
