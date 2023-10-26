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

export function TextFileLoader(file: FileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadPdfIntoMemory(
        memory: Memory,
        _clientOptions: InputClientOptions = {},
    ) {
        const fileBuffer = await fileInputToBuffer(file);
        const splittedFile = splitString(fileBuffer.toString("utf8"), maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(batches.map(async (batch) => memory.add(batch)));
        }

        await batchify(splittedFile, 10, addBatchIntoMemory);
    };
}

export function StringLoader(str: string, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadPdfIntoMemory(
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

export function AudioLoader(file: FileInput, maxTokenPerChunk = 100): LoaderFunction {
    return async function loadAudioIntoMemory(
        memory: Memory,
        clientOptions: InputClientOptions = {},
    ) {
        const fileBuffer = await fileInputToBuffer(file);
        const transcription = await transcribe(fileBuffer, {}, clientOptions);
        const transcriptions = splitString(transcription, maxTokenPerChunk);

        async function addBatchIntoMemory(batches: string[]) {
            await Promise.all(batches.map(async (batch) => memory.add(batch)));
        }

        await batchify(transcriptions, 10, addBatchIntoMemory);
    };
}

export async function loaderToMemory(
    loaders: LoaderFunction | LoaderFunction[],
    clientOptions: InputClientOptions = {},
): Promise<Memory> {
    const memory = new Memory(undefined, clientOptions);

    if (typeof loaders === "function") {
        await loaders(memory, clientOptions);
    } else {
        await Promise.all(loaders.map((loader) => loader(memory, clientOptions)));
    }

    return memory;
}
