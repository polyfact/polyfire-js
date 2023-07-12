import fetch from "node-fetch";
import * as t from "io-ts";

const API_URL = "http://localhost:8080";
const { POLYFACT_TOKEN = "" } = process.env;

function internalTsio2JSON(type: any): any {
    if (type._tag === "InterfaceType") {
        return Object.entries(type.props)
            .map(([key, value]) => [key, internalTsio2JSON(value)])
            .reduce((prev, curr) => Object.assign(prev, { [curr[0]]: curr[1] }), {});
    }
    if (type._tag === "ArrayType") {
        return [internalTsio2JSON(type.type)];
    }
    if (type._tag === "NumberType") {
        return "number";
    }
    if (type._tag === "StringType") {
        return "string";
    }
    if (type._tag === "BooleanType") {
        return "boolean";
    }

    throw new Error(
        `Unsupported type "${type}".\nPlease use one of:\n\t- InterfaceType (t.type)\n\t- ArrayType (t.array)\n\t- NumberType (t.number)\n\t- StringType (t.string)\n\t- BooleanType (t.boolean)`,
    );
}

function tsio2JSON(type: t.TypeC<any>): any {
    const res = JSON.parse(JSON.stringify(type));

    return internalTsio2JSON(res);
}

const ErrorType = t.type({
    error: t.string,
});

class GenerationError extends Error {
    errorType?: string;

    constructor(errorType?: string) {
        switch (errorType) {
            case "parse_type_failed":
                super("The server failed to parse the provided type.");
                break;
            case "llm_init_failed":
                super("The server failed to initialize its LLM.");
                break;
            case "generation_failed":
                super(
                    "The generation failed. It's usually because the task is not specific enough or doesn't match with the provided type.",
                );
                break;
            default:
                super("An unknown error occured");
                break;
        }
        this.errorType = errorType || "unknown_error";
    }
}

const ResultType = t.type({
    result: t.any,
    token_usage: t.type({
        input: t.number,
        output: t.number,
    }),
});

async function generateWithTypeWithTokenUsage<T extends t.Props>(
    task: string,
    type: t.TypeC<T>,
): Promise<{ result: t.TypeOf<t.TypeC<T>>; tokenUsage: { input: number; output: number } }> {
    const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": POLYFACT_TOKEN,
        },
        body: JSON.stringify({ task, return_type: tsio2JSON(type) }),
    }).then((res) => res.json());

    if (!ResultType.is(res)) {
        console.log(res);
        throw new GenerationError();
    }

    if (!type.is(res.result)) {
        if (ErrorType.is(res.result)) {
            throw new GenerationError(res.result.error);
        }
        throw new GenerationError();
    }

    return { result: res.result, tokenUsage: res.token_usage };
}

async function generateWithType<T extends t.Props>(
    task: string,
    type: t.TypeC<T>,
): Promise<t.TypeOf<t.TypeC<T>>> {
    const res = await generateWithTypeWithTokenUsage(task, type);

    return res.result;
}

export { generateWithType, generateWithTypeWithTokenUsage };
