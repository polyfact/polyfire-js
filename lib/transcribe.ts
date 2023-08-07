import axios from "axios";
import FormData from "form-data";
import { Readable } from "readable-stream";
import * as t from "polyfact-io-ts";
import { InputClientOptions, defaultOptions } from "./clientOpts";

const ResultType = t.type({
    text: t.string,
});

export async function transcribe(
    file: Buffer | Readable,
    clientOptions: InputClientOptions = {},
): Promise<string> {
    const { token, endpoint } = await defaultOptions(clientOptions);

    const formData = new FormData();
    formData.append("file", file, {
        contentType: "audio/mp3",
        filename: "file.mp3",
    });

    const res = await axios.post(`${endpoint}/transcribe`, formData, {
        headers: {
            "X-Access-Token": token,
        },
    });

    const { data } = res;

    if (ResultType.is(data)) {
        return data.text;
    }

    throw new Error(`Unexpected response from polyfact: ${JSON.stringify(data, null, 2)}`);
}
export default function client(clientOptions: InputClientOptions = {}) {
    return {
        transcribe: (file: Buffer | Readable) => transcribe(file, clientOptions),
    };
}
