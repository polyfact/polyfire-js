import axios from "axios";
import * as t from "polyfact-io-ts";

import { File } from "./folder_to_json";

const API_URL = "https://api.polyfact.com/api/v1";

const GenerateResponse = t.type({
    docs_id: t.string,
    status: t.string,
});

export async function generateReferences(
    files: File[],
    token: string,
): Promise<t.TypeOf<typeof GenerateResponse>> {
    const res = await axios.post(
        `${API_URL}/reference`,
        {
            files_list: files,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        },
    );

    const { data } = res;

    if (!GenerateResponse.is(data)) {
        throw new Error(`Unexpected response type in generateReferences: ${JSON.stringify(data)}`);
    }

    return data;
}

const ProgressResponse = t.type({
    last_updated: t.number,
    progress: t.number,
    percentage: t.number,
    total: t.number,
    status: t.string,
});

export async function getProgress(
    docId: string,
    type: "references" | "folders",
    token: string,
): Promise<t.TypeOf<typeof ProgressResponse>> {
    const res = await axios.get(`${API_URL}/progress/${docId}/${type}`, {
        headers: {
            "X-Access-Token": token,
        },
    });

    const { data } = res;

    if (!ProgressResponse.is(data)) {
        throw new Error(`Unexpected response type in getProgress: ${JSON.stringify(data)}`);
    }

    return data;
}

export async function generate(
    docId: string,
    type: "folders" | "structure" | "overview" | "getting-started",
    token: string,
): Promise<t.TypeOf<typeof GenerateResponse>> {
    const res = await axios.post(
        `${API_URL}/${type}`,
        {
            doc_id: docId,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        },
    );

    const { data } = res;

    if (!GenerateResponse.is(data)) {
        throw new Error(`Unexpected response type in generate: ${JSON.stringify(data)}`);
    }

    return data;
}

const StructureResponse = t.type({
    structure: t.string,
    status: t.string,
});

export async function getStructure(
    docId: string,
    token: string,
): Promise<t.TypeOf<typeof StructureResponse>> {
    const res = await axios.get(`${API_URL}/structure/${docId}`, {
        headers: {
            "X-Access-Token": token,
        },
    });

    const { data } = res;

    if (!StructureResponse.is(data)) {
        throw new Error(`Unexpected response type in getStructure: ${JSON.stringify(data)}`);
    }

    return data;
}

const OverviewResponse = t.type({
    overview: t.string,
    status: t.string,
});

export async function getOverview(
    docId: string,
    token: string,
): Promise<t.TypeOf<typeof OverviewResponse>> {
    const res = await axios.get(`${API_URL}/overview/${docId}`, {
        headers: {
            "X-Access-Token": token,
        },
    });
    const { data } = res;

    if (!OverviewResponse.is(data)) {
        throw new Error(`Unexpected response type in getOverview: ${JSON.stringify(data)}`);
    }

    return data;
}

const GettingStartedResponse = t.type({
    getting_started_markdown: t.string,
    status: t.string,
});

export async function getGettingStarted(
    docId: string,
    token: string,
): Promise<t.TypeOf<typeof GettingStartedResponse>> {
    const res = await axios.get(`${API_URL}/getting-started/${docId}`, {
        headers: {
            "X-Access-Token": token,
        },
    });

    const { data } = res;

    if (!GettingStartedResponse.is(data)) {
        throw new Error(`Unexpected response type in getGettingStarted: ${JSON.stringify(data)}`);
    }

    return data;
}

export interface GetResult {
    status: string;
}

export type getFunction<T extends GetResult> = (docId: string, token: string) => Promise<T>;

const DeployResponse = t.type({
    status: t.string,
    domain: t.string,
});

export async function deploy(
    docId: string,
    name: string,
    domain: string,
    token: string,
): Promise<t.TypeOf<typeof DeployResponse>> {
    const res = await axios.post(
        `${API_URL}/deploy`,
        { doc_id: docId, name, domain },
        {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token,
            },
        },
    );

    const { data } = res;

    if (!DeployResponse.is(data)) {
        throw new Error(`Unexpected response type in deploy: ${JSON.stringify(data)}`);
    }

    return data;
}
