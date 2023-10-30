import * as t from "polyfact-io-ts";
import { generate, GenerationOptions } from "./generate";

import { generateWithType } from "./probabilistic_helpers/generateWithType";
import { transcribe } from "./transcribe";
import { Chat } from "./chats";
import { Memory, createMemory, updateMemory, getAllMemories } from "./memory";
import { splitString, tokenCount } from "./split";
import { usage } from "./user";
import { get as KVGet, set as KVSet, del as KVDel, all as KVAll } from "./kv";
import PolyfireClientBuilder from "./client";
import { generateImage } from "./image";
import { TextFileLoader, StringLoader, AudioLoader } from "./dataloader";

export type { LoaderFunction } from "./dataloader";

// Export types and models
export type { TokenUsage, Ressource, GenerationResult } from "./generate";
export * from "./helpers/models";

// KV operations
const kv = {
    get: KVGet,
    set: KVSet,
    del: KVDel,
    all: KVAll,
};

// Export methods
export {
    // text generation
    generate,
    generateWithType,
    GenerationOptions,
    Chat,

    // transcription
    transcribe,

    // memory
    createMemory,
    updateMemory,
    getAllMemories,
    Memory,

    // utils
    usage,
    splitString,
    tokenCount,
    t,
    kv,

    // Image generation
    generateImage,

    // Loader
    TextFileLoader,
    StringLoader,
    AudioLoader,
};

export default PolyfireClientBuilder;
