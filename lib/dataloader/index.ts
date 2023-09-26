import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
import { Memory } from "../memory";
import { transcribe } from "../transcribe";
import { splitString } from "../split";
import { FileInput, fileInputToBuffer } from "../utils";

import { InputClientOptions } from "../clientOpts";

async function batchify<T extends Array<unknown>>(
    array: T,
    size: number,
    callback: (input: T) => Promise<void>,
): Promise<void> {
    if (array.length < size) {
        await callback(array);
        return;
    }
    await callback(array.slice(0, size) as T);
    await batchify(array.slice(size) as T, size, callback);
}

export type LoaderFunction = (memory: Memory, clientOptions: InputClientOptions) => Promise<void>;

export function StringLoader(str: string, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadStringIntoMemory(
        memory: Memory,
        _clientOptions: InputClientOptions = {},
    ) {
        const splittedStr = splitString(str, maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(batches.map(async (batch) => memory.add(batch)));
        }

        await batchify(splittedStr, 10, addBatchIntoMemory);
    };
}

export function TextFileLoader(file: FileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadTextIntoMemory(...args) {
        const fileBuffer = await fileInputToBuffer(file);
        return StringLoader(fileBuffer.toString("utf8"), maxTokenPerChunk)(...args);
    };
}

export function AudioLoader(file: FileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadAudioIntoMemory(
        memory: Memory,
        clientOptions: InputClientOptions = {},
    ) {
        const fileBuffer = await fileInputToBuffer(file);
        const transcription = await transcribe(fileBuffer, clientOptions);
        return StringLoader(transcription, maxTokenPerChunk)(memory, clientOptions);
    };
}

export async function pdfToString(pdf: Uint8Array): Promise<string> {
    if (typeof window === "undefined") {
        GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.js`;
    } else {
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;
    }
    const pdfDocument = await getDocument(pdf).promise;
    const pagesPromises = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        pagesPromises.push(pdfDocument.getPage(i));
    }

    const pages = await Promise.all(pagesPromises);

    const textEntries = await Promise.all(
        pages.map(async (page) => {
            const pageObject = await page.getTextContent();

            return pageObject.items
                .map((e) => ("str" in e ? e.str : ""))
                .filter((e) => e !== "")
                .join("\n");
        }),
    );

    return textEntries.join("\n");
}

export function PdfLoader(file: FileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadPdfIntoMemory(...args) {
        const fileBuffer = await fileInputToBuffer(file);
        const pdfText = await pdfToString(new Uint8Array(fileBuffer));
        return StringLoader(pdfText, maxTokenPerChunk)(...args);
    };
}

export async function loaderToMemory(
    loaders: LoaderFunction | LoaderFunction[],
    clientOptions: InputClientOptions = {},
): Promise<Memory> {
    const memory = new Memory(clientOptions);

    if (typeof loaders === "function") {
        await loaders(memory, clientOptions);
    } else {
        await Promise.all(loaders.map((loader) => loader(memory, clientOptions)));
    }

    return memory;
}
