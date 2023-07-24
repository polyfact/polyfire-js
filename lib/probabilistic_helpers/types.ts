import * as tNoDesc from "io-ts";

function description<T extends {}>(this: T, description: string): T {
    return { ...this, _desc: description };
}

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
    ...a: Parameters<T>
) => TNewReturn;

type ConstantWithDescription<T extends {}> = T & {
    description: typeof description;
};

type FunctionWithDescription<T extends (...args: any[]) => any> = ReplaceReturnType<
    T,
    ReturnType<T> & { description: typeof description }
>;

type newT<T extends typeof tNoDesc> = {
    string: ConstantWithDescription<T["string"]>;
    number: ConstantWithDescription<T["number"]>;
    boolean: ConstantWithDescription<T["boolean"]>;
    null: ConstantWithDescription<T["null"]>;
    keyof: FunctionWithDescription<T["keyof"]>;
    literal: FunctionWithDescription<T["literal"]>;
    union: FunctionWithDescription<T["union"]>;
    intersection: FunctionWithDescription<T["intersection"]>;
    type: FunctionWithDescription<T["type"]>;
    partial: FunctionWithDescription<T["partial"]>;
    array: FunctionWithDescription<T["array"]>;
};

function addDescriptionToFunction(fn: any): any {
    return (...args: any[]) => {
        const res: any = fn(...args);

        res.description = description;
        return res;
    };
}

function extendsT(iots: typeof tNoDesc): newT<typeof tNoDesc> {
    const sorry = iots as any;

    sorry.string.description = description;
    sorry.number.description = description;
    sorry.boolean.description = description;
    sorry.null.description = description;
    sorry.keyof = addDescriptionToFunction(sorry.keyof);
    sorry.literal = addDescriptionToFunction(sorry.literal);
    sorry.union = addDescriptionToFunction(sorry.union);
    sorry.intersection = addDescriptionToFunction(sorry.intersection);
    sorry.type = addDescriptionToFunction(sorry.type);
    sorry.partial = addDescriptionToFunction(sorry.partial);
    sorry.array = addDescriptionToFunction(sorry.array);

    return sorry as newT<typeof tNoDesc>;
}

const t = extendsT(tNoDesc);

export { t };
