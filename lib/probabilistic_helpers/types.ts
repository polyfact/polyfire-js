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

type newT<T extends typeof tNoDesc> = Omit<
    T,
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "keyof"
    | "literal"
    | "union"
    | "intersection"
    | "type"
    | "partial"
    | "array"
> & {
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

function defineDescriptionConst(obj: any, descriptionF: any, key: string) {
    const old = obj[key];
    Object.defineProperty(old, "description", {
        get: () => descriptionF,
    });

    Object.defineProperty(obj, key, {
        get: () => old,
    });
}

function defineDescriptionFn(obj: any, key: string) {
    const old = obj[key];
    Object.defineProperty(obj, key, {
        get: () => addDescriptionToFunction(old),
    });
}

function extendsT(iots: typeof tNoDesc): newT<typeof tNoDesc> {
    const sorry = iots as any;

    defineDescriptionConst(sorry, description, "string");
    defineDescriptionConst(sorry, description, "number");
    defineDescriptionConst(sorry, description, "boolean");
    defineDescriptionConst(sorry, description, "null");
    defineDescriptionFn(sorry, "keyof");
    defineDescriptionFn(sorry, "literal");
    defineDescriptionFn(sorry, "union");
    defineDescriptionFn(sorry, "intersection");
    defineDescriptionFn(sorry, "type");
    defineDescriptionFn(sorry, "partial");
    defineDescriptionFn(sorry, "array");

    return sorry as newT<typeof tNoDesc>;
}

const t = extendsT(tNoDesc);

export { t };
