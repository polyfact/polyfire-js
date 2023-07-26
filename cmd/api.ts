import fetch from "isomorphic-fetch";
import * as t from "io-ts";

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
    const res = await fetch(`${API_URL}/reference`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token,
        },
        body: JSON.stringify({ files_list: files }),
    }).then((res: any) => res.json());

    if (!GenerateResponse.is(res)) {
        throw new Error(`Unexpected response type in generateReferences: ${JSON.stringify(res)}`);
    }

    return res;
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
    const res = await fetch(`${API_URL}/progress/${docId}/${type}`, {
        headers: {
            "X-Access-Token": token,
        },
    }).then((res: any) => res.json());

    if (!ProgressResponse.is(res)) {
        throw new Error(`Unexpected response type in getProgress: ${JSON.stringify(res)}`);
    }

    return res;
}

export async function generate(
    docId: string,
    type: "folders" | "structure" | "overview" | "getting-started",
    token: string,
): Promise<t.TypeOf<typeof GenerateResponse>> {
    const res = await fetch(`${API_URL}/${type}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token,
        },
        body: JSON.stringify({ doc_id: docId }),
    }).then((res: any) => res.json());

    if (!GenerateResponse.is(res)) {
        throw new Error(`Unexpected response type in generate: ${JSON.stringify(res)}`);
    }

    return res;
}

const StructureResponse = t.type({
    structure: t.string,
    status: t.string,
});

export async function getStructure(
    docId: string,
    token: string,
): Promise<t.TypeOf<typeof StructureResponse>> {
    const res = await fetch(`${API_URL}/structure/${docId}`, {
        headers: {
            "X-Access-Token": token,
        },
    }).then((res: any) => res.json());

    if (!StructureResponse.is(res)) {
        throw new Error(`Unexpected response type in getStructure: ${JSON.stringify(res)}`);
    }

    return res;
}

const OverviewResponse = t.type({
    overview: t.string,
    status: t.string,
});

export async function getOverview(
    docId: string,
    token: string,
): Promise<t.TypeOf<typeof OverviewResponse>> {
    const res = await fetch(`${API_URL}/overview/${docId}`, {
        headers: {
            "X-Access-Token": token,
        },
    }).then((res: any) => res.json());

    if (!OverviewResponse.is(res)) {
        throw new Error(`Unexpected response type in getOverview: ${JSON.stringify(res)}`);
    }

    return res;
}

const GettingStartedResponse = t.type({
    getting_started_markdown: t.string,
    status: t.string,
});

export async function getGettingStarted(
    docId: string,
    token: string,
): Promise<t.TypeOf<typeof GettingStartedResponse>> {
    const res = await fetch(`${API_URL}/getting-started/${docId}`, {
        headers: {
            "X-Access-Token": token,
        },
    }).then((res: any) => res.json());

    if (!GettingStartedResponse.is(res)) {
        throw new Error(`Unexpected response type in getGettingStarted: ${JSON.stringify(res)}`);
    }

    return res;
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
    const res = await fetch(`${API_URL}/deploy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token,
        },
        body: JSON.stringify({ doc_id: docId, name, domain }),
    }).then((res: any) => res.json());

    if (!DeployResponse.is(res)) {
        throw new Error(`Unexpected response type in deploy: ${JSON.stringify(res)}`);
    }

    return res;
}
