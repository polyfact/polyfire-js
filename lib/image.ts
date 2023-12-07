import axios, { AxiosError } from "axios";
import * as t from "polyfact-io-ts";
import { InputClientOptions, defaultOptions } from "./clientOpts";
import { ApiError, ErrorData } from "./helpers/error";

export type ImageGenerationOptions = {
    model?: "dall-e-2" | "dall-e-3" | string;
};

const ImageGenerationResponseType = t.type({
    url: t.string,
});

export async function generateImage(
    prompt: string,
    { model }: ImageGenerationOptions = {},
    clientOptions: InputClientOptions = {},
): Promise<t.TypeOf<typeof ImageGenerationResponseType>> {
    try {
        const { token, endpoint } = await defaultOptions(clientOptions);

        const url = new URL(`${endpoint}/image/generate`);

        url.searchParams.append("p", prompt);
        url.searchParams.append("format", "json");

        if (model) {
            url.searchParams.append("model", model);
        }

        const image = await axios.get(url.toString(), {
            headers: {
                "X-Access-Token": token,
            },
        });

        if (!ImageGenerationResponseType.is(image.data)) {
            throw new ApiError({
                code: "mismatched_response",
                message: "The response from the API does not match the expected format",
            });
        }

        return image.data;
    } catch (e: unknown) {
        console.error(e);
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
        generateImage: (prompt: string, options: ImageGenerationOptions = {}) =>
            generateImage(prompt, options, clientOptions),
    };
}
