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
        }, 1000);
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
    .option(
        "-o, --output <output_folder>",
        'The path to the doc folder that will be created (default "./docs")',
    )
    .action(async (folder, { output }) => {
        const folderJson = await getJSONFolderRepresentation(folder);

        const { docs_id: docId } = await generateReferences(folderJson);

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
    });

program.parse();
