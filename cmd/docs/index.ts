import inquirer from "inquirer";
import cliProgress from "cli-progress";

import { getJSONFolderRepresentation } from "./folder_to_json";
import {
    generateReferences,
    getProgress,
    generate,
    GetResult,
    getFunction,
    getStructure,
    getOverview,
    getGettingStarted,
    deploy,
} from "./api";

async function waitProgress(docId: string, type: "references" | "folders", token: string) {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(0, -1);
    await new Promise<void>((res) => {
        const interval = setInterval(async () => {
            const { total, progress } = await getProgress(docId, type, token).catch(() => ({
                last_updated: 0,
                progress: -1,
                percentage: 0.0,
                total: 0,
                status: "waiting",
            }));

            progressBar.setTotal(total);
            progressBar.update(progress);

            if (progress >= total) {
                clearInterval(interval);
                res();
            }
        }, 300);
    });
    progressBar.stop();
}

async function waitSimpleGeneration<T extends GetResult>(
    docId: string,
    getFunction: getFunction<T>,
    token: string,
) {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(1, 0);
    await new Promise<void>((res) => {
        const interval = setInterval(async () => {
            const { status } = await getFunction(docId, token).catch(() => ({ status: undefined }));

            if (status === "ok") {
                progressBar.update(1);
                clearInterval(interval);
                res();
            }
        }, 1000);
    });
    progressBar.stop();
}

export default async function generateDocs(): Promise<string> {
    try {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "folder",
                message: "The path of the folder to generate doc from:",
                default: "./",
            },
            {
                type: "input",
                name: "name",
                message: "The name of the doc (default to id):",
            },
            {
                type: "input",
                name: "deploy",
                message: "The docs will be deployed to the subdomain provided:",
            },
            {
                type: "input",
                name: "doc_id",
                message: "If the doc_id has already been generated, you can enter it here:",
            },
            {
                type: "input",
                name: "token",
                message: "Your polyfire token:",
                default: process.env.POLYFACT_TOKEN,
            },
        ]);

        const { folder, token } = answers;
        let { name, doc_id: docId, deploy: subdomain } = answers;

        const folderJson = await getJSONFolderRepresentation(folder);

        if (!docId) {
            ({ docs_id: docId } = await generateReferences(folderJson, token));
        }

        console.log(`Generating references for ${docId}...`);
        await waitProgress(docId, "references", token);

        await generate(docId, "folders", token);
        console.log(`Generating folder summaries for ${docId}...`);
        await waitProgress(docId, "folders", token);

        await generate(docId, "structure", token);
        console.log(`Generating structure for ${docId}...`);
        await waitSimpleGeneration(docId, getStructure, token);

        await generate(docId, "overview", token);
        console.log(`Generating overview for ${docId}...`);
        await waitSimpleGeneration(docId, getOverview, token);

        await generate(docId, "getting-started", token);
        console.log(`Generating getting started for ${docId}...`);
        await waitSimpleGeneration(docId, getGettingStarted, token);

        if (!subdomain) {
            subdomain = name ? `${name}-${docId}` : docId;
        }

        if (!name) {
            name = docId;
        }

        if (subdomain) {
            console.log("Deploying...");
            const { domain: deployedDomain } = await deploy(docId, name, subdomain, token);
            console.log(`Deployement started. The docs will be deployed to "${deployedDomain}"`);
        }

        return docId;
    } catch (error: unknown) {
        console.error("An error occurred:", error instanceof Error ? error.message : error);
        throw error;
    }
}
