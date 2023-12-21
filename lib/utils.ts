import { Mutex } from "async-mutex";
import { Buffer } from "buffer";
import { PolyfireError } from "./helpers/error";

let token: string | undefined;
let endpoint: string | undefined;

if (typeof process !== "undefined") {
    token = process?.env?.POLYFACT_TOKEN;
    endpoint = process?.env?.POLYFACT_ENDPOINT;
}

export const POLYFACT_TOKEN = token;
export const POLYFACT_ENDPOINT = endpoint;

function splitPromiseResolver<T>(): [Promise<T>, (value: T) => void] {
    let resolver: (value: T) => void;
    const promise = new Promise<T>((resolve) => {
        resolver = resolve;
    });

    return [promise, resolver!]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
}

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
        [this.promiseResult, this.resolver] = splitPromiseResolver();
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
            [this.promiseResult, this.resolver] = splitPromiseResolver();
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

        throw new PolyfireError("Missing function in then");
    }
}

export type OnFn<R> = ((t: "data", listener: (chunk: Buffer) => void) => R) &
    ((t: "error", listener: (err: Error) => void) => R) &
    ((t: string, listener: (...args: unknown[]) => void) => R);

export interface MinimalStream {
    on: OnFn<this>;
}

export interface FetchReadableStream {
    getReader(): {
        read(): Promise<{ done: boolean; value?: Uint8Array | undefined }>;
    };
}

export type FileInput = MinimalStream | Buffer | FetchReadableStream | Uint8Array;

function stream2buffer(stream: MinimalStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buf: Buffer[] = [];

        stream.on("data", (chunk) => buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(buf)));
        stream.on("error", (err) => reject(err));
    });
}

async function fetchStream2buffer(stream: FetchReadableStream): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    let done = false;
    let value: Uint8Array | undefined;
    while (!done) {
        // eslint-disable-next-line no-await-in-loop
        ({ done, value } = await reader.read());
        if (value) {
            chunks.push(value);
        }
    }

    return Buffer.concat(chunks);
}

export async function fileInputToBuffer(input: FileInput): Promise<Buffer> {
    if (input instanceof Buffer) {
        return input;
    }

    if (input instanceof Uint8Array) {
        return Buffer.from(input);
    }

    if ("on" in input) {
        return stream2buffer(input);
    }

    if ("getReader" in input) {
        return fetchStream2buffer(input);
    }

    return null as never;
}
