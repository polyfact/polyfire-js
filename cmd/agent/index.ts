/* eslint-disable consistent-return */
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import { cloneRepo } from "../utils";

export default async function agent(options: { project?: string }): Promise<void> {
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
            when: (answer: { boilerplate: string }) =>
                !options?.project && answer.boilerplate === "Yes",
        },
    ];
    try {
        const answers: { boilerplate: string; token?: string; name?: string; project?: string } =
            await inquirer.prompt(questions);

        if (answers.boilerplate === "No") return;

        const defaultProject = options?.project || answers?.project;
        const repoName = answers?.name || "polyfire-agent-boilerplate";
        const repoURL = "https://github.com/polyfire-ai/polyfire-use-agent-boilerplate";

        await cloneRepo(repoURL, repoName);

        const filePath = path.join(repoName, ".env");
        const envContent = `REACT_APP_POLYFIRE_PROJECT=${defaultProject}`;

        await fs.writeFile(filePath, envContent.trim(), "utf8");

        console.log("env file created successfully!");

        console.info(
            `You can now make "cd ${repoName} ; npm install ; npm run start" to start the Agent.\n\n`,
        );
        console.info("Don't forget to set your PROJECT_ID.\n");
        console.info("you can get one at https://app.polyfire.com.\n\n");
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
    }
}
