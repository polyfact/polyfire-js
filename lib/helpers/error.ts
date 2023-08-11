export interface ErrorData {
    code: string;
    message: string;
}

export class ApiError extends Error {
    errorType?: string;

    errorMessage?: string;

    constructor(errorData: ErrorData) {
        super(errorData?.message);

        this.errorType = errorData?.code || "unknown_error";
        this.errorMessage = errorData?.message || "An unknown error occured";
    }
}
