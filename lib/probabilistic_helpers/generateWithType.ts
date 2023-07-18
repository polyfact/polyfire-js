import * as t from "io-ts";
import fetch from "node-fetch";
import { generate, generateWithTokenUsage } from "../index";

function internalTsio2JSON(type: any, indent: number): string {
    if (type._tag === "InterfaceType") {
        const leftpad0 = Array(2 * indent)
            .fill(" ")
            .join("");
        const leftpad1 = Array(2 * (indent + 1))
            .fill(" ")
            .join("");
        return `{${Object.entries(type.props)
            .map(([key, value]) => [key, internalTsio2JSON(value, indent + 1)])
            .reduce(
                (prev, curr) => `${prev}\n${leftpad1}"${curr[0]}": ${curr[1]},`,
                "",
            )}\n${leftpad0}}`;
    }
    if (type._tag === "ArrayType") {
        return `[${internalTsio2JSON(type.type, indent)}]`;
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

function tsio2String(type: t.TypeC<any>): string {
    const res = JSON.parse(JSON.stringify(type));

    return internalTsio2JSON(res, 0);
}

function generateTypedPrompt(typeFormat: string, task: string) {
    return `Your goal is to write a JSON object that will accomplish a specific task.\nThe string inside the JSON must be plain text, and not contain any markdown or HTML unless explicitely mentionned in the task.\nThe JSON object should follow this type:\n\`\`\`\n${typeFormat}\n\`\`\` The task you must accomplish:\n${task}\n\nPlease only provide the JSON in a single json markdown code block with the keys described above. Do not include any other text.\nPlease make sure the JSON is a single line and does not contain any newlines outside of the strings.`;
}

export async function generateWithTypeWithTokenUsage<T extends t.Props>(
    task: string,
    type: t.TypeC<T>,
): Promise<{ result: t.TypeOf<t.TypeC<T>>; tokenUsage: { input: number; output: number } }> {
    const typeFormat = tsio2String(type);
    const tokenUsage = { input: 0, output: 0 };
    for (let tryCount = 0; tryCount < 5; tryCount++) {
        const { result: resultJson, token_usage: tu } = await generateWithTokenUsage(
            generateTypedPrompt(typeFormat, task),
        );

        tokenUsage.output += tu.output;
        tokenUsage.input += tu.input;

        let result;
        try {
            result = JSON.parse(resultJson);
        } catch (e) {
            continue;
        }

        if (!type.is(result)) {
            continue;
        }

        return { result, tokenUsage };
    }

    throw new Error("Generation failed to match the given type after 5 retry");
}

export async function generateWithType<T extends t.Props>(
    task: string,
    type: t.TypeC<T>,
): Promise<t.TypeOf<t.TypeC<T>>> {
    const res = await generateWithTypeWithTokenUsage(task, type);

    return res.result;
}
