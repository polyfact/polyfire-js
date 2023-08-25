import * as t from "polyfact-io-ts";
import { generate, generateWithTokenUsage, GenerationOptions } from "./generate";
import {
    generateWithType,
    generateWithTypeWithTokenUsage,
} from "./probabilistic_helpers/generateWithType";
import { transcribe } from "./transcribe";
import { Chat } from "./chats";
import { Memory, createMemory, updateMemory, getAllMemories } from "./memory";
import { splitString, tokenCount } from "./split";
import { usage } from "./user";
import { get as KVGet, set as KVSet } from "./kv";
import Polyfact, { PolyfactClientBuilder } from "./client";
import usePolyfact from "./hooks/usePolyfact";
import useChat from "./hooks/useChat";
import { generateImage } from "./image";

// Export types and models
export type { TokenUsage, Ressource, GenerationResult } from "./generate";
export * from "./helpers/models";

// KV operations
const kv = {
    get: KVGet,
    set: KVSet,
};

// Export methods
export {
    generate,
    generateWithTokenUsage,
    generateWithType,
    generateWithTypeWithTokenUsage,
    splitString,
    tokenCount,
    t,
    GenerationOptions,
    transcribe,
    createMemory,
    updateMemory,
    getAllMemories,
    Chat,
    Memory,
    kv,
    usage,
    usePolyfact,
    useChat,
    PolyfactClientBuilder,
    generateImage,
};

export default Polyfact;
