import "module-alias/register";
import { Command } from "commander";
import cliProgress from "cli-progress";

import { version } from "@packagejson";
import { getJSONFolderRepresentation } from "@/folder_to_json";
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
} from "@/api";

const program = new Command();

async function waitProgress(docId: string, type: "references" | "folders") {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(0, -1);
    await new Promise<void>((res, rej) => {
        const interval = setInterval(async () => {
            const { total, progress } = await getProgress(docId, type).catch(() => ({
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
) {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progressBar.start(1, 0);
    await new Promise<void>((res, rej) => {
        const interval = setInterval(async () => {
            const { status } = await getFunction(docId).catch(() => ({ status: undefined }));

            if (status === "ok") {
                progressBar.update(1);
                clearInterval(interval);
                res();
            }
        }, 1000);
    });
    progressBar.stop();
}

program
    .name("polyfact")
    .version(version)
    .command("docs")
    .description("Generate documentation for a project")
    .argument("<folder>", "The path of the folder to generate doc from")
    .option("-n, --name <doc_name>", "The name of the doc (default to id)")
    .option("-d, --deploy <subdomain>", "The docs will be deployed to the subdomain provided")
    .option(
        "--doc_id <doc_id>",
        "If the doc_id has already been generated, you can send it in argument here",
    )
    .option(
        "-o, --output <output_folder>",
        'The path to the doc folder that will be created (default "./docs")',
    )
    .action(async (folder, { output, name, deploy: subdomain, doc_id: docId }) => {
        const folderJson = await getJSONFolderRepresentation(folder);

        if (!docId) {
            const { docs_id: docId } = await generateReferences(folderJson);
        }

        console.log(`Generating references for ${docId}...`);
        await waitProgress(docId, "references");

        await generate(docId, "folders");
        console.log(`Generating folder summaries for ${docId}...`);
        await waitProgress(docId, "folders");

        await generate(docId, "structure");
        console.log(`Generating structure for ${docId}...`);
        await waitSimpleGeneration(docId, getStructure);

        await generate(docId, "overview");
        console.log(`Generating overview for ${docId}...`);
        await waitSimpleGeneration(docId, getOverview);

        await generate(docId, "getting-started");
        console.log(`Generating getting started for ${docId}...`);
        await waitSimpleGeneration(docId, getGettingStarted);

        if (!name) {
            name = docId;
        }

        if (subdomain) {
            console.log("Deploying...");
            const { domain: deployedDomain } = await deploy(docId, name, subdomain);
            console.log(`Deployement started. The docs will be deployed to "${deployedDomain}"`);
        }
    });

program.parse();
