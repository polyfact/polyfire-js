import fetch from "isomorphic-fetch";
import FormData from "form-data";
import { Readable } from "stream";
import * as t from "polyfact-io-ts";

const { POLYFACT_ENDPOINT = "https://api2.polyfact.com" } = process.env;
const { POLYFACT_TOKEN = "" } = process.env;

const ResultType = t.type({
    text: t.string,
});

export async function transcribe(file: Buffer | Readable): Promise<string> {
    if (!POLYFACT_TOKEN) {
        throw new Error(
            "Please put your polyfact token in the POLYFACT_TOKEN environment variable. You can get one at https://app.polyfact.com",
        );
    }

    const formData = new FormData();
    formData.append("file", file, {
        contentType: "audio/mp3",
        filename: "file.mp3",
    });

    const res = await fetch(`${POLYFACT_ENDPOINT}/transcribe`, {
        method: "POST",
        headers: {
            "X-Access-Token": POLYFACT_TOKEN,
        },
        body: formData as any,
    }).then((res: any) => res.json());

    if (ResultType.is(res)) {
        return res.text;
    }

    throw new Error(`Unexpected response from polyfact: ${JSON.stringify(res, null, 2)}`);
}
