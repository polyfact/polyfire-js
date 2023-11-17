import path from "path";
import fs from "fs/promises";

import { exec } from "child_process";

function addUnderscoreBeforeCapitalLetters(str: string): string {
    return str.replace(/([A-Z])/g, (match, offset) => (offset > 0 ? `_${match}` : match));
}

export async function createEnvironmentFile(
    repo: string,
    options: Record<string, string>,
    prefix: string,
): Promise<void> {
    const filename = ".env";
    const filePath = path.join(repo, filename);

    let envContent = "";

    try {
        for (const [key, value] of Object.entries(options)) {
            if (value) {
                const envVariableName = `${prefix}POLYFIRE_${addUnderscoreBeforeCapitalLetters(
                    key,
                ).toUpperCase()}`;
                envContent += `${envVariableName}=${value}\n`;
            }
        }

        await fs.writeFile(filePath, envContent.trim(), "utf8");
    } catch (error) {
        console.error("Error writing environment file:", error);
        throw error;
    }
}

function sanitizeInput(input: string): string {
    return input.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

export function cleanOptions(options: Record<string, string>): Record<string, string> {
    const keysToSkip = ["stack"];
    return Object.fromEntries(
        Object.entries(options).map(([key, value]) => [
            key,
            keysToSkip.includes(key) || typeof value !== "string" ? value : sanitizeInput(value),
        ]),
    );
}

export async function cloneRepository(repoURL: string, repo: string): Promise<void> {
    if (
        await fs.access(repo).then(
            () => true,
            () => false,
        )
    ) {
        console.info("Repository already exists. No action taken.");
        process.exit(0);
    }

    return new Promise((resolve, reject) => {
        exec(`git clone ${repoURL} ${repo}`, (error) => {
            if (error) reject(`Error cloning the repository: ${error}`);
            resolve();
        });
    });
}
