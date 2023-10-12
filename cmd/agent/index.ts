/* eslint-disable consistent-return */
import { exec } from "child_process";
import inquirer from "inquirer";
import fs from "fs/promises";

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

export default async function agent(token: string): Promise<void> {
    const questions = [
        {
            type: "list",
            name: "boilerplate",
            message: "Would you like to test the Agent boilerplate ?",
            choices: ["Yes", "No"],
            default: "Yes",
        },
        {
            type: "input",
            name: "token",
            message: "Please provide your POLYFACT_TOKEN:",
            default: token,
            when: (answers: { boilerplate: string }) => answers.boilerplate === "Yes" && !token,
        },
        {
            type: "input",
            name: "name",
            message: "What is the name of the repository you wish to clone?",
            default: "polyfire-agent-boilerplate",
            when: (answers: { boilerplate: string }) => answers.boilerplate === "Yes",
        },
    ];
    try {
        const answers: { boilerplate: string; token?: string; name?: string } =
            await inquirer.prompt(questions);

        if (answers.boilerplate === "No") return;

        if (!answers?.token && !token) throw new Error("POLYFACT_TOKEN is required.");

        const repoName = answers?.name || "polyfire-agent-boilerplate";

        const repoURL = "https://github.com/polyfire/polyfire-use-agent-boilerplate.git";

        await cloneRepo(repoURL, repoName);

        console.info(
            `You can now make "cd ${repoName} ; npm install ; npm run start" to start the Agent.\n\n`,
        );
        console.info("Don't forget to set your PROJECT_ID.\n");
        console.info("you can get one at https://app.polyfire.com.\n\n");
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
    }
}
