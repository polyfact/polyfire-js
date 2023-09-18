import { Mutex } from "async-mutex";

let token: string | undefined;
let endpoint: string | undefined;

if (typeof process !== "undefined") {
    token = process?.env?.POLYFACT_TOKEN;
    endpoint = process?.env?.POLYFACT_ENDPOINT;
}

export const POLYFACT_TOKEN = token;
export const POLYFACT_ENDPOINT = endpoint;

type UnresolvedResult = { status: "pending" };
type ResolvedResult<T> = { value: T; status: "resolved" };
type ErrorResult = { error: Error; status: "rejected" };
type Result<T> = UnresolvedResult | ResolvedResult<T> | ErrorResult;

export class MutablePromise<T> implements PromiseLike<T> {
    result: Result<T> = {
        status: "pending",
    };

    promiseResult: Promise<ResolvedResult<T> | ErrorResult>;

    resolver: (v: ResolvedResult<T> | ErrorResult) => void;

    mutex = new Mutex();

    constructor() {
        let resolver: (v: ResolvedResult<T> | ErrorResult) => void;
        this.promiseResult = new Promise<ResolvedResult<T> | ErrorResult>((resolve, reject) => {
            resolver = resolve;
        });
        this.resolver = resolver!;
    }

    set(value: T): void {
        const { status } = this.result;
        const resolved: ResolvedResult<T> = Object.assign(this.result, {
            value,
            status: "resolved" as const,
        });

        if (status === "pending") {
            this.resolver(resolved);
        }
    }

    throw(error: Error): void {
        const { status } = this.result;
        const rejected: ErrorResult = Object.assign(this.result, {
            error,
            status: "rejected" as const,
        });

        if (status === "pending") {
            this.resolver(rejected);
        }
    }

    async deresolve(): Promise<void> {
        await this.mutex.runExclusive(() => {
            let resolver: (v: ResolvedResult<T> | ErrorResult) => void;
            this.promiseResult = new Promise<ResolvedResult<T> | ErrorResult>((resolve) => {
                resolver = resolve;
            });
            this.resolver = resolver!;
            Object.assign(this.result, {
                status: "pending" as const,
                value: undefined,
            });
        });
    }

    async then<R1 = never, R2 = never>(
        res?: null | ((c: T) => R1 | Promise<R1>),
        rej?: null | ((e: Error) => R2 | Promise<R2>),
    ): Promise<R1 | R2> {
        try {
            const value = await this.mutex.runExclusive(async () => {
                const result = await this.promiseResult;

                if (result.status === "rejected") {
                    throw result.error;
                }

                return result.value;
            });

            if (res) {
                return res(value);
            }
        } catch (e: unknown) {
            if (rej) {
                return rej(e as Error);
            }

            throw e;
        }

        throw new Error("Missing function in then");
    }
}
