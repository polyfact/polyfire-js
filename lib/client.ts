import generateClient, { GenerationClient } from "./generate";
import generateWithTypeClient, {
    GenerationWithTypeClient,
} from "./probabilistic_helpers/generateWithType";
import transcribeClient, { TranscribeClient } from "./transcribe";
import chatClient, { ChatClient } from "./chats";
import embeddingsClient, { EmbeddingsClient } from "./embeddings";
import userClient, { UserClient } from "./user";
import { ClientOptions } from "./clientOpts";
import kvClient, { KVClient } from "./kv";
import imageGenerationClient, { ImageGenerationClient } from "./image";
import { MutablePromise } from "./utils";
import authClient, { AuthClient } from "./auth";
import ttsClient, { TTSClient } from "./tts";

export type Client = {
    models: GenerationClient &
        GenerationWithTypeClient &
        TranscribeClient &
        ImageGenerationClient &
        TTSClient;
    data: EmbeddingsClient & { kv: KVClient };
    utils: ChatClient;
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
            ...ttsClient(co),
        },
        data: {
            ...embeddingsClient(co),
            kv: kvClient(co),
        },
        utils: {
            ...chatClient(co),
        },
        auth: {
            ...authClient(co, projectOptions),
            user: userClient(co),
        },
    };
}

export default function PolyfireClientBuilder({
    project,
    endpoint = "https://api.polyfire.com",
}: {
    project: string;
    endpoint?: string;
}): Client {
    const clientOptionsPromise = new MutablePromise<Partial<ClientOptions>>();

    return client(clientOptionsPromise, { project, endpoint });
}
