import * as t from "polyfact-io-ts";
import generateClient, {
    generateWithInfo,
    generateStreamWithInfos,
    generate,
    generateWithTokenUsage,
    GenerationOptions,
} from "./generate";
import generateWithTypeClient, {
    generateWithType,
    generateWithTypeWithTokenUsage,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { transcribe } from "./transcribe";
import chatClient, { Chat } from "./chats";
import memoryClient, { Memory, createMemory, updateMemory, getAllMemories } from "./memory";
import { splitString, tokenCount } from "./split";
import { ClientOptions } from "./clientOpts";
import kvClient, { get as KVGet, set as KVSet } from "./kv";

export type Ressource = {
    similarity: number;
    id: string;
    content: string;
};

export type TokenUsage = {
    input: number;
    output: number;
};

export type Answer = {
    result: string;
    // eslint-disable-next-line camelcase
    token_usage: {
        input: number;
        output: number;
    };
    Err: unknown;
    ressources: Ressource[];
};

const kv = {
    get: KVGet,
    set: KVSet,
};

export {
    generate,
    generateWithTokenUsage,
    generateWithType,
    generateWithTypeWithTokenUsage,
    generateWithInfo,
    generateStreamWithInfos,
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
};

export default function client(clientOptions: Partial<ClientOptions>) {
    return {
        ...generateClient(clientOptions),
        ...generateWithTypeClient(clientOptions),
        ...transcribeClient(clientOptions),
        ...memoryClient(clientOptions),
        ...chatClient(clientOptions),
        kv: kvClient(clientOptions),
    };
}
