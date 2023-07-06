import fs from "fs";
import path from "path";

import {
    extensions as excludedExtensionsArray,
    names as excludedNamesArray,
} from "@/excluded_extensions.json";

const excludedExtensions = new Set(excludedExtensionsArray);
const excludedNames = new Set(excludedNamesArray);

export interface File {
    path: string;
    name: string;
    content: string;
}

export async function getJSONFolderRepresentation(
    root: string,
    relativePath = "",
): Promise<File[]> {
    const dirPath = path.join(root, relativePath);

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    const res = await Promise.all(
        entries.map(async (dirent) => {
            if (excludedNames.has(dirent.name) || dirent.name.startsWith(".")) {
                return [];
            }
            const entryPath = path.join(relativePath, dirent.name);
            if (dirent.isDirectory()) {
                return getJSONFolderRepresentation(root, entryPath);
            }
            if (dirent.isFile()) {
                if (excludedExtensions.has(path.extname(dirent.name))) {
                    return [];
                }
                const filePath = path.join(root, entryPath);
                const content = await fs.promises.readFile(filePath, "utf-8");

                return { path: entryPath, name: dirent.name, content };
            }
            return [];
        }),
    );

    return res.flat();
}
