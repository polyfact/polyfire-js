/* eslint-disable @typescript-eslint/no-use-before-define */
import * as t from "polyfact-io-ts";
import { generate, GenerationOptions } from "../generate";
import { InputClientOptions } from "../clientOpts";
import { PolyfireError } from "../helpers/error"

// The ts.io types are way too complex for me to write, I didn't want to spend 2 days fixing this so I
// decided to bypass the typechecker and throw an error at runtime if the type is not supported.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typePartial2String(entries: [string, any][], indent: number, partial: boolean): string {
    const leftpad = Array(2 * (indent + 1))
        .fill(" ")
        .join("");
    return entries
        .map(([key, value]) => [
            key,
            internalTsio2String(value, indent + 1),
            value._desc ? ` // ${value._desc}` : "",
        ])
        .reduce(
            (prev, curr) =>
                `${prev}\n${leftpad}${JSON.stringify(curr[0])}${partial ? "?" : ""}: ${curr[1]},${
                    curr[2]
                }`,
            "",
        );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function internalTsio2String(type: any, indent: number): string {
    const leftpad = Array(2 * indent)
        .fill(" ")
        .join("");
    if (type._tag === "InterfaceType") {
        return `{${typePartial2String(Object.entries(type.props), indent + 1, false)}\n${leftpad}}`;
    }
    if (type._tag === "IntersectionType") {
        let res = "";
        for (const t in type.types) {
            if (type.types[t]._tag === "InterfaceType" || type.types[t]._tag === "PartialType") {
                res += typePartial2String(
                    Object.entries(type.types[t].props),
                    indent + 1,
                    type.types[t]._tag === "PartialType",
                );
            }
        }
        return `{${res}\n${leftpad}}`;
    }
    if (type._tag === "KeyofType") {
        return type.name;
    }
    if (type._tag === "UnionType") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return type.types.map((t: any) => internalTsio2String(t, indent + 1)).join(" | ");
    }
    if (type._tag === "LiteralType") {
        return JSON.stringify(type.value);
    }
    if (type._tag === "ArrayType") {
        return `[${internalTsio2String(type.type, indent)}]`;
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
    if (type._tag === "NullType") {
        return "null";
    }

    throw new PolyfireError(
        `Unsupported type "${type._tag}".\nPlease use one of:\n\t- InterfaceType (t.type)\n\t- ArrayType (t.array)\n\t- NumberType (t.number)\n\t- StringType (t.string)\n\t- BooleanType (t.boolean)`,
    );
}

function tsio2String<T extends t.Props>(type: t.TypeC<T>): string {
    const res = JSON.parse(JSON.stringify(type));

    return internalTsio2String(res, 0);
}

function generateTypedPrompt(typeFormat: string, task: string) {
    return `Your goal is to write a JSON object that will accomplish a specific task.\nThe string inside the JSON must be plain text, and not contain any markdown or HTML unless explicitely mentionned in the task.\nThe JSON object should follow this type:\n\`\`\`\n${typeFormat}\n\`\`\` The task you must accomplish:\n${task}\n\nPlease only provide the JSON in a single json markdown code block with the keys described above. Do not include any other text.\nPlease make sure the JSON is a single line and does not contain any newlines outside of the strings.`;
}

export async function generateWithType<
    T extends t.Props,
    O extends GenerationOptions & { infos?: boolean },
>(
    task: string,
    type: t.TypeC<T>,
    options?: O,
    clientOptions: InputClientOptions = {},
): Promise<
    O extends { infos: true }
        ? { result: t.TypeOf<t.TypeC<T>>; tokenUsage: { input: number; output: number } }
        : t.TypeOf<t.TypeC<T>>
> {
    const typeFormat = tsio2String(type);
    const tokenUsage = { input: 0, output: 0 };
    for (let tryCount = 0; tryCount < 5; tryCount++) {
        const { result: resultJson, tokenUsage: tu } = await generate(
            generateTypedPrompt(typeFormat, task),
            options || {},
            clientOptions,
        ).infos();

        tokenUsage.output += tu.output;
        tokenUsage.input += tu.input;

        let result;
        try {
            result = JSON.parse(
                resultJson
                    .replace("\n", "")
                    .replace(/^```((json)|(JSON))?/, "")
                    .replace(/```$/, ""),
            );
        } catch (e) {
            continue;
        }

        if (!type.is(result)) {
            continue;
        }

        if (!options?.infos) {
            return result as unknown as ReturnType<typeof generateWithType<T, O>>;
        }
        return { result, tokenUsage } as unknown as ReturnType<typeof generateWithType<T, O>>;
    }

    throw new PolyfireError(
        "Generation failed to match the given type after 5 retry",
    );
}

export type GenerationWithTypeClient = {
    generateWithType: <T extends t.Props, O extends GenerationOptions & { infos?: boolean }>(
        task: string,
        type: t.TypeC<T>,
        options?: O,
    ) => Promise<
        O extends { infos: true }
            ? { result: t.TypeOf<t.TypeC<T>>; tokenUsage: { input: number; output: number } }
            : t.TypeOf<t.TypeC<T>>
    >;
};

export default function client(clientOptions: InputClientOptions = {}): GenerationWithTypeClient {
    return {
        generateWithType: <T extends t.Props, O extends GenerationOptions & { infos?: boolean }>(
            task: string,
            type: t.TypeC<T>,
            options?: O,
        ) => generateWithType(task, type, options, clientOptions),
    };
}
