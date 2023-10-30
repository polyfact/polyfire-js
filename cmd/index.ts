// eslint-disable-next-line import/no-extraneous-dependencies
import inquirer from "inquirer";
import docs from "./docs";
import chat from "./chat";
import agent from "./agent";

let token: string;

async function promptUser(initial = true) {
    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "appType",
            message: "What do you want to build?",
            choices: ["Create chatbot", "Create agent", "Quit"],
        },
    ]);

    if (initial) token = process.env.POLYFACT_TOKEN as string;

    switch (answer.appType) {
        case "Create chatbot":
            await chat(token);
            promptUser(false);
            break;
        case "Create agent":
            await agent(token);
            promptUser(false);
            break;
        case "Create docs":
            docs();
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
