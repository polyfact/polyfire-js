import { Mutex } from "async-mutex";

let token: string | undefined;
let endpoint: string | undefined;

if (typeof process !== "undefined") {
    token = process?.env?.POLYFACT_TOKEN;
    endpoint = process?.env?.POLYFACT_ENDPOINT;
}

export const POLYFACT_TOKEN = token;
export const POLYFACT_ENDPOINT = endpoint;

type UnresolvedResult = { isResolved: false };
type ResolvedResult<T> = { value: T; isResolved: true };
type Result<T> = UnresolvedResult | ResolvedResult<T>;

export class MutablePromise<T> implements PromiseLike<T> {
    result: Result<T> = {
        isResolved: false,
    };

    promiseResult: Promise<ResolvedResult<T>>;

    resolver: (v: ResolvedResult<T>) => void;

    mutex = new Mutex();

    constructor() {
        let resolver: (v: ResolvedResult<T>) => void;
        this.promiseResult = new Promise<ResolvedResult<T>>((resolve) => {
            resolver = resolve;
        });
        this.resolver = resolver!;
    }

    set(value: T): void {
        const { isResolved } = this.result;
        const resolved: ResolvedResult<T> = Object.assign(this.result, {
            value,
            isResolved: true as const,
        });

        if (!isResolved) {
            this.resolver(resolved);
        }
    }

    async deresolve(): Promise<void> {
        await this.mutex.runExclusive(() => {
            let resolver: (v: ResolvedResult<T>) => void;
            this.promiseResult = new Promise<ResolvedResult<T>>((resolve) => {
                resolver = resolve;
            });
            this.resolver = resolver!;
            Object.assign(this.result, {
                isResolved: false as const,
                value: undefined,
            });
        });
    }

    async then<R1 = never, R2 = never>(
        res?: null | ((c: T) => R1 | Promise<R1>),
        _rej?: null | ((e: Error) => R2 | Promise<R2>),
    ): Promise<R1 | R2> {
        const value = await this.mutex.runExclusive(async () => {
            return this.promiseResult.then((r: { value: T }) => r.value);
        });

        if (res) {
            return res(value);
        }

        throw new Error("Missing function in then");
    }
}
