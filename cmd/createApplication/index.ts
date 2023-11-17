import inquirer, { InputQuestion, ListQuestion } from "inquirer";
import { Template, TEMPLATE_DETAILS } from "..";
import { cloneRepository, createEnvironmentFile, cleanOptions } from "../utils";

export type CustomQuestion = InputQuestion | ListQuestion;

function mergeAndCleanOptions(
    cliOptions: Record<string, string>,
    userResponses: Record<string, string>,
): Record<string, string> {
    const mergedOptions = { ...cliOptions, ...userResponses };
    delete mergedOptions.template;
    return mergedOptions;
}

export default async function createApplication(
    template: Template,
    appName: string,
    cliOptions: Record<string, string>,
    additionalPrompts: CustomQuestion[],
): Promise<boolean> {
    const standardPrompts: CustomQuestion[] = [
        {
            type: "input",
            name: "project",
            message: "Enter your project alias (obtain one at https://app.polyfire.com):",
            when: () => !cliOptions?.project,
        },
    ];

    const allPrompts = [...standardPrompts, ...additionalPrompts];

    try {
        const userResponses = await inquirer.prompt(allPrompts);

        const sanitizedResponses = cleanOptions(userResponses);
        const finalTemplate = template || sanitizedResponses.template;

        if (!finalTemplate || !TEMPLATE_DETAILS[finalTemplate]) {
            throw new Error(`Invalid or missing template: ${finalTemplate}`);
        }

        const finalOptions = mergeAndCleanOptions(cliOptions, sanitizedResponses);
        const templateConfig = TEMPLATE_DETAILS[finalTemplate];

        await cloneRepository(templateConfig.repositoryUrl, appName);
        await createEnvironmentFile(appName, finalOptions, templateConfig.envVariablePrefix);

        console.info(
            `Application setup complete! To get started, run:\n\n  cd ${appName};\n  npm install;\n  npm run dev;\n`,
        );
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
    }

    return true;
}
