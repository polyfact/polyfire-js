export type Ressource = {
    similarity: number;
    id: string;
    content: string;
};

export type TokenUsage = {
    input: number;
    output: number;
};

export type Answer = {
    result: string;
    // eslint-disable-next-line camelcase
    token_usage: {
        input: number;
        output: number;
    };
    Err: unknown;
    ressources: Ressource[];
};
