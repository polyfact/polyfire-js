import { chmod, writeFile, readFile, access, mkdir } from "node:fs/promises";
import { TextDecoder } from "node:util";
import { join } from "node:path";

import esbuild, { Plugin, PluginBuild } from "esbuild";

import { version } from "../package.json";

const OUTPUT_DIR = "build";

async function exists(path: string) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function cli(): Promise<string> {
    const header = `#!/usr/bin/env node\n`;

    const consts = `export const VERSION="${version}";\n`;
    const build = new TextDecoder().decode(
        (
            await esbuild.build({
                platform: "node",
                bundle: true,
                format: "cjs",
                minify: true,
                entryPoints: ["src/index.ts"],
                write: false,
                plugins: [],
            })
        ).outputFiles[0].contents,
    );
    const final = header + build;

    const outputPath = join(OUTPUT_DIR, "polyfact");
    await writeFile(outputPath, final);
    await chmod(outputPath, 0o755);

    return final;
}

(async () => {
    if (!(await exists(OUTPUT_DIR))) {
        await mkdir(OUTPUT_DIR);
    }

    await cli();
})();
