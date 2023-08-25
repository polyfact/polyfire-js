import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

export type ImageGenerationOptions = {
    provider?: "openai" | "midjourney";
};

const ImageGenerationResponseType = t.type({
    url: t.string,
});

export async function generateImage(
    prompt: string,
    options: ImageGenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<t.TypeOf<typeof ImageGenerationResponseType>> {
    try {
        const { token, endpoint } = await defaultOptions(clientOptions);

        const { provider = "openai" } = options;
        const image = await axios.get(
            `${endpoint}/image/generate?p=${encodeURIComponent(
                prompt,
            )}&provider=${encodeURIComponent(provider)}&format=json`,
            {
                headers: {
                    "X-Access-Token": token,
                },
            },
        );

        if (!ImageGenerationResponseType.is(image.data)) {
            console.log(image);
            throw new ApiError({
                code: "mismatched_response",
                message: "The response from the API does not match the expected format",
            });
        }

        return image.data;
    } catch (e: unknown) {
        console.log(e);
        if (e instanceof AxiosError) {
            throw new ApiError(e?.response?.data as ErrorData);
        }
        throw e;
    }
}

export type ImageGenerationClient = {
    generateImage: (
        prompt: string,
        options: ImageGenerationOptions,
    ) => Promise<t.TypeOf<typeof ImageGenerationResponseType>>;
};

export default function client(clientOptions: InputClientOptions = {}): ImageGenerationClient {
    return {
        generateImage: (prompt: string, options: ImageGenerationOptions) =>
            generateImage(prompt, options, clientOptions),
    };
}
