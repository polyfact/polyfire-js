import pdf from "pdf-parse";

import { Memory } from "../memory";
import { transcribe } from "../transcribe";
import { splitString } from "../split";

interface MinimalStream {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

type LoaderInput = string | MinimalStream | Buffer;

function stream2buffer(stream: MinimalStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buf: any[] = [];

        stream.on("data", (chunk) => buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(buf)));
        stream.on("error", (err) => reject(err));
    });
}

async function loaderInputToBuffer(input: LoaderInput): Promise<Buffer> {
    if (input instanceof Buffer) {
        return input;
    }
    if (typeof input === "string") {
        const fs = await import("fs");
        return new Promise<Buffer>((res, rej) =>
            fs.readFile(input, (err, data) => (err !== null ? rej(err) : res(data))),
        );
    }

    return stream2buffer(input);
}

async function pdfParsePages(fileBuffer: Buffer): Promise<string[]> {
    return new Promise((res, rej) => {
        const result: string[] = [];
        pdf(fileBuffer, {
            pagerender: (e) => {
                return e
                    .getTextContent()
                    .then((e: { items: { str: string }[] }) => e.items.map((s) => s.str).join("\n"))
                    .then((r: string) => result.push(r));
            },
        }).then(() => res(result));
    });
}

async function batchify<T extends Array<unknown>>(
    array: T,
    size: number,
    callback: (input: T) => Promise<void>,
): Promise<void> {
    if (array.length < size) {
        return callback(array);
    }
    await callback(array.slice(0, size) as T);
    await batchify(array.slice(size) as T, size, callback);
}

export type LoaderFunction = (memory: Memory) => Promise<void>;

export function PDFLoader(file: LoaderInput): LoaderFunction {
    return async function loadPdfIntoMemory(memory: Memory) {
        const fileBuffer = await loaderInputToBuffer(file);
        const allPages = await pdfParsePages(fileBuffer);

        async function addPagesIntoMemory(pages: string[]) {
            await Promise.all(pages.map((page) => memory.add(page)));
        }

        await batchify(allPages, 10, addPagesIntoMemory);
    };
}

export function AudioLoader(file: LoaderInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadAudioIntoMemory(memory: Memory) {
        const fileBuffer = await loaderInputToBuffer(file);
        const transcription = await transcribe(fileBuffer);
        const transcriptions = splitString(transcription, maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(
                batches.map(async (batch) => {
                    await memory.add(batch).then(() => console.log(batch));
                }),
            );
        }

        await batchify(transcriptions, 10, addBatchIntoMemory);
    };
}

export async function loaderToMemory(loaders: LoaderFunction | LoaderFunction[]): Promise<Memory> {
    const memory = new Memory();

    if (typeof loaders === "function") {
        await loaders(memory);
    } else {
        await Promise.all(loaders.map((loader) => loader(memory)));
    }

    return memory;
}
