import inquirer from "inquirer";
import client, { Prompt } from "../../lib/prompt";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

function showPrompt(prompt: Prompt, index: number) {
    console.info(`
        --- Prompt #${index + 1} ---
        ID          : ${prompt.id}
        Name        : ${prompt.name}
        Description : ${prompt.description}
        Tags        : ${prompt?.tags?.join(", ") || "None"}
    `);
}

async function managePrompts(token: string): Promise<boolean> {
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all prompts",
                "Get prompt by name",
                "Get prompt by ID",
                "Create a new prompt",
                "Update a prompt by ID",
                "Delete a prompt by ID",
                "Back",
            ],
        },
        {
            type: "input",
            name: "token",
            message: "Please provide your POLYFACT_TOKEN:",
            default: process.env.POLYFACT_TOKEN,
            when: () => token === undefined,
        },
    ]);

    const promptClient = client({ token });

    switch (answers.action) {
        case "Back":
            return false;
        case "View all prompts":
            const prompts = await promptClient.getAllPrompts();
            prompts.forEach((prompt, index) => showPrompt(prompt, index));
            return true;
        case "Get prompt by name":
            const { name } = await inquirer.prompt({
                type: "input",
                name: "name",
                message: "Input the prompt's name:",
            });
            const promptByName = await promptClient.getPromptByName(name);
            console.info(promptByName);
            return true;
        case "Get prompt by ID":
            const { id } = await inquirer.prompt({
                type: "input",
                name: "id",
                message: "Input the prompt's ID:",
            });
            const promptById = await promptClient.getPromptById(id);
            console.log(promptById);
            return true;
        case "Create a new prompt":
            const newPrompt = await inquirer.prompt([
                {
                    type: "input",
                    name: "name",
                    message: "Input the prompt's name:",
                },
                {
                    type: "input",
                    name: "description",
                    message: "Input the prompt's description:",
                },
                {
                    type: "input",
                    name: "prompt",
                    message: "Input the prompt's content:",
                },
                {
                    type: "input",
                    name: "tags",
                    message: "Enter tags (comma separated):",
                    filter: (input: string) => input.split(",").map((tag) => tag.trim()),
                },
            ]);
            const createdPrompt = await promptClient.createPrompt(newPrompt);
            console.log("Prompt created:", createdPrompt);
            return true;
        case "Update a prompt by ID":
            const updateData = await inquirer.prompt([
                {
                    type: "input",
                    name: "id",
                    message: "Input the ID of the prompt you would like to update:",
                },
                {
                    type: "input",
                    name: "name",
                    message: "Update the prompt's name (leave it blank to skip):",
                },
                {
                    type: "input",
                    name: "description",
                    message: "Update the prompt's description (leave it blank to skip):",
                },
                {
                    type: "input",
                    name: "prompt",
                    message: "Update the prompt's content (leave it blank to skip):",
                },
                {
                    type: "input",
                    name: "tags",
                    message: "Update tags (comma separated, leave blank to skip):",
                    filter: (input: string) => input.split(",").map((tag) => tag.trim()),
                },
            ]);
            const updatedPrompt = await promptClient.updatePrompt(updateData.id, {
                name: updateData.name || undefined,
                description: updateData.description || undefined,
                prompt: updateData.prompt || undefined,
                tags: updateData.tags || undefined,
            });
            console.log("Prompt updated:", updatedPrompt);
            return true;
        case "Delete a prompt by ID":
            const { deleteId } = await inquirer.prompt({
                type: "input",
                name: "deleteId",
                message: "Input the ID of the prompt you would like to delete:",
            });
            await promptClient.deletePrompt(deleteId);
            console.log("Prompt deleted successfully.");
            return true;
        default:
            console.log("Invalid choice");
            return false;
    }
}

export default managePrompts;
