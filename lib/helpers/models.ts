interface ModelDetails {
    resolvedName: string;
    contextSize: number;
}

export const models: Record<string, ModelDetails> = {
    "gpt-3.5-turbo-16k": { resolvedName: "gpt-3.5-turbo-16k", contextSize: 16384 },
    "gpt-3.5-turbo-": { resolvedName: "gpt-3.5-turbo", contextSize: 4096 },
    "gpt-4-32k-": { resolvedName: "gpt-4-32k", contextSize: 32768 },
    "gpt-4-": { resolvedName: "gpt-4", contextSize: 8192 },
    "code-davinci-002": { resolvedName: "code-davinci-002", contextSize: 8000 },
    "text-davinci-003": { resolvedName: "text-davinci-003", contextSize: 4097 },
    "text-curie-001": { resolvedName: "text-curie-001", contextSize: 2048 },
    "text-babbage-001": { resolvedName: "text-babbage-001", contextSize: 2048 },
    "text-ada-001": { resolvedName: "text-ada-001", contextSize: 2048 },
    "code-cushman-001": { resolvedName: "code-cushman-001", contextSize: 2048 },
};

export const getModelSize = (modelName: string): number => {
    for (const prefix in models) {
        if (modelName.startsWith(prefix)) {
            return models[prefix].contextSize;
        }
    }

    throw new Error(`Unknown model name: ${modelName}`);
};

export const getEmbeddingSize = (modelName: string): number => {
    return modelName === "text-embedding-ada-002" ? 8191 : 2046;
};
