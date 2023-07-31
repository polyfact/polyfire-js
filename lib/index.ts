import * as t from "polyfact-io-ts";
import generateClient, { generate, generateWithTokenUsage, GenerationOptions } from "./generate";
import generateWithTypeClient, {
    generateWithType,
    generateWithTypeWithTokenUsage,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { transcribe } from "./transcribe";
import chatClient, { Chat } from "./chats";
import memoryClient, { Memory, createMemory, updateMemory, getAllMemories } from "./memory";
import { splitString, tokenCount } from "./split";
import { ClientOptions } from "./clientOpts";

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
};

export default function client(clientOptions: Partial<ClientOptions>) {
    return {
        ...generateClient(clientOptions),
        ...generateWithTypeClient(clientOptions),
        ...transcribeClient(clientOptions),
        ...memoryClient(clientOptions),
        ...chatClient(clientOptions),
    };
}
