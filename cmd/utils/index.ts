import path from "path";
import fs from "fs/promises";

import { exec } from "child_process";
import { Stack } from "..";

export async function generateEnvFile(
    repo: string,
    stack: Stack,
    botname: string,
    project: string,
): Promise<void> {
    const filename = ".env";
    const filePath = path.join(repo, filename);
    const prefix = stack === "react" ? "VITE_" : "NEXT_PUBLIC_";

    const envContent = `
        ${prefix}POLYFIRE_PROJECT=${project}
        ${prefix}BOT_NAME=${botname}
    `;

    await fs.writeFile(filePath, envContent.trim(), "utf8");

    console.log("env file created successfully!");
}

function sanitizeInput(input: string): string {
    return input.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

export function sanitizeOptions(options: Record<string, string>): Record<string, string> {
    const keysToSkip = ["stack"];
    return Object.fromEntries(
        Object.entries(options).map(([key, value]) => [
            key,
            keysToSkip.includes(key) || typeof value !== "string" ? value : sanitizeInput(value),
        ]),
    );
}

export async function cloneRepo(repoURL: string, repo: string): Promise<void> {
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
