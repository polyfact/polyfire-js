import generateClient, { GenerationClient } from "./generate";
import generateWithTypeClient, {
    GenerationWithTypeClient,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { TranscribeClient } from "./transcribe";
import chatClient, { ChatClient } from "./chats";
import memoryClient, { MemoryClient } from "./memory";
import userClient, { UserClient } from "./user";
import promptClient, { PromptClient } from "./prompt";
import { ClientOptions } from "./clientOpts";
import kvClient, { KVClient } from "./kv";
import imageGenerationClient, { ImageGenerationClient } from "./image";
import { MutablePromise } from "./utils";
import authClient, { AuthClient } from "./auth";

export type Client = {
    models: GenerationClient & GenerationWithTypeClient & TranscribeClient & ImageGenerationClient;
    data: MemoryClient & { kv: KVClient };
    utils: ChatClient & PromptClient;
    auth: {
        user: UserClient;
    } & AuthClient;
};

export function client(
    co: MutablePromise<Partial<ClientOptions>>,
    projectOptions: { project: string; endpoint: string },
): Client {
    return {
        models: {
            ...generateClient(co),
            ...generateWithTypeClient(co),
            ...transcribeClient(co),
            ...imageGenerationClient(co),
        },
        data: {
            ...memoryClient(co),
            kv: kvClient(co),
        },
        utils: {
            ...chatClient(co),
            ...promptClient(co),
        },
        auth: {
            ...authClient(co, projectOptions),
            user: userClient(co),
        },
    };
}

export default function PolyfactClientBuilder({
    project,
    endpoint = "https://api.polyfact.com",
}: {
    project: string;
    endpoint?: string;
}): Client {
    const clientOptionsPromise = new MutablePromise<Partial<ClientOptions>>();

    return client(clientOptionsPromise, { project, endpoint });
}
