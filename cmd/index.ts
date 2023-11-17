import { program } from "commander";
import inquirer from "inquirer";
import createApplication, { CustomQuestion } from "./createApplication";

enum ProjectType {
    CHAT = "chat",
    AGENT = "agent",
}

type TemplateName = `${ProjectType.CHAT | ProjectType.AGENT}-${string}${string}`;

const CHAT_REACT_VITE: TemplateName = "chat-react-vite";
const CHAT_NEXTJS: TemplateName = "chat-nextjs";
const AGENT_REACT: TemplateName = "agent-react";

const knownTemplates: TemplateName[] = [CHAT_REACT_VITE, CHAT_NEXTJS, AGENT_REACT];

export type Template = (typeof knownTemplates)[number];

type TemplateDetails = {
    repositoryUrl: string;
    envVariablePrefix: string;
};

const CREATE_CHATBOT = "Create chatbot";
const CREATE_AGENT = "Create agent";

export const TEMPLATE_DETAILS: Record<Template, TemplateDetails> = {
    [CHAT_REACT_VITE]: {
        repositoryUrl: "https://github.com/polyfire-ai/polyfire-chat-react-boilerplate.git",
        envVariablePrefix: "VITE_",
    },
    [CHAT_NEXTJS]: {
        repositoryUrl: "https://github.com/polyfire-ai/polyfire-chat-nextjs-boilerplate.git",
        envVariablePrefix: "NEXT_PUBLIC_",
    },
    [AGENT_REACT]: {
        repositoryUrl: "https://github.com/polyfire-ai/polyfire-use-agent-boilerplate",
        envVariablePrefix: "REACT_APP_",
    },
};

const questions = (
    options: Record<string, string>,
    template?: string,
): Record<string, CustomQuestion[]> => ({
    chat: [
        {
            type: "input",
            name: "botname",
            message: "Enter the name of the bot",
            default: "polyfire-bot",
            when: () => !options?.botname,
        },
        {
            type: "list",
            name: "template",
            message: "Choose a template",
            choices: knownTemplates.filter((t) => t.startsWith(ProjectType.CHAT)),
            when: () => !template,
        },
    ],
    agent: [
        {
            type: "list",
            name: "template",
            message: "Choose a template",
            choices: knownTemplates.filter((t) => t.startsWith(ProjectType.AGENT)),
            when: () => !template,
        },
    ],
});

async function handleCommand({
    appName,
    template,
    ...options
}: {
    appName: string;
    template?: Template;
    botname?: string;
    project?: string;
}): Promise<void> {
    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What do you want to build?",
            choices: [CREATE_CHATBOT, CREATE_AGENT, "Quit"],
            when: () => !template,
        },
    ]);

    if (template && !knownTemplates.includes(template)) {
        console.error(`Unknown template: ${template}`);
        return;
    } else if (!template && !answer.action) {
        console.error("No template selected");
        return;
    }

    let actionType: string = answer.action;

    if (template) {
        if (template.startsWith(ProjectType.CHAT)) {
            actionType = ProjectType.CHAT;
        } else if (template.startsWith(ProjectType.AGENT)) {
            actionType = ProjectType.AGENT;
        }
    } else if (answer.action === CREATE_CHATBOT) {
        actionType = ProjectType.CHAT;
    } else if (answer.action === CREATE_AGENT) {
        actionType = ProjectType.AGENT;
    }

    const additionalQuestions = questions(options, template)[actionType];

    switch (actionType) {
        case ProjectType.CHAT:
        case ProjectType.AGENT:
            await createApplication(template as Template, appName, options, additionalQuestions);
            break;
        case "Quit":
            console.info("Bye!");
            return;
        default:
            console.log("Invalid choice");
            break;
    }
}

function displayHelpMessage() {
    console.info("Please specify the project directory:");
    console.info("  create-polyfire-app <project-directory>\n");
    console.info("For example:");
    console.info("  create-polyfire-app my-polyfire-app\n");
    console.info("Run 'create-polyfire-app --help' to see all options.");
}

function groupTemplatesByType(templates: TemplateName[]) {
    return templates.reduce<Record<string, TemplateName[]>>((groupedTemplates, template) => {
        const [type] = template.split("-");
        if (!groupedTemplates[type]) {
            groupedTemplates[type] = [];
        }
        groupedTemplates[type].push(template);
        return groupedTemplates;
    }, {});
}

function displayGroupedTemplates(groupedTemplates: Record<string, TemplateName[]>) {
    Object.entries(groupedTemplates).forEach(([type, templates]) => {
        console.info(`${type.toUpperCase()}:\n`);
        templates.forEach((template, index) => {
            console.info(`  ${index + 1}. ${template}`);
        });
        console.info("\n");
    });
}

function configureCLI() {
    program
        .name("create-polyfire-app")
        .description("A tool to create new applications with specified templates.")
        .argument("<app-name>", "The name of the new application")
        .option("--template <template>", "Template to use (use --list to see available templates)")
        .option("--project <project>", "The project name")
        .option("--botname <botname>", "The name of the bot (only for chat templates)")
        .action((appName, options) => {
            handleCommand({ appName, ...options });
        });

    program
        .command("list")
        .description("List all available templates")
        .action(() => {
            console.info("Available templates:\n");
            const groupedTemplates = groupTemplatesByType(knownTemplates);
            displayGroupedTemplates(groupedTemplates);
            console.info(
                "Use 'create-polyfire-app <app-name> --template <template-name>' to create a new application.",
            );
        });
}

function main() {
    if (process.argv.length <= 2) {
        displayHelpMessage();
    } else {
        configureCLI();
        program.parse(process.argv);
    }
}

main();
