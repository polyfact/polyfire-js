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

export default async function agent({ project }: { project?: string }): Promise<void> {
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
            name: "name",
            message: "What is the name of the repository you wish to clone?",
            default: "polyfire-agent-boilerplate",
            when: (answers: { boilerplate: string }) => answers.boilerplate === "Yes",
        },
        {
            type: "input",
            name: "project",
            message: "What is your project Alias ?",
            when: () => !project,
        },
    ];
    try {
        const answers: { boilerplate: string; token?: string; name?: string; project?: string } =
            await inquirer.prompt(questions);

        if (answers.boilerplate === "No") return;

        const defaultProject = project || answers.project;

        const repoName = answers?.name || "polyfire-agent-boilerplate";

        const repoURL = "https://github.com/polyfire-ai/polyfire-use-agent-boilerplate";

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
