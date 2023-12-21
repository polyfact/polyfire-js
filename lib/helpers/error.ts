export interface ErrorData {
    code: string;
    message: string;
}

export class PolyfireError extends Error {
    constructor(message: string) {
        super(`polyfire-js: ${message}`);
    }
}

export class ApiError extends PolyfireError {
    errorType?: string;

    errorMessage?: string;

    constructor(errorData: ErrorData) {
        super(`ApiError: ${errorData?.message}`);

        this.errorType = errorData?.code || "unknown_error";
        this.errorMessage = errorData?.message || "An unknown error occured";
    }
}
