// src/types/response.interface.ts
export interface SampleResponseInterface<T = any> {
    data: T;
    message: string;
    statusCode: number;
}

/**
 * Creates a SampleResponseInterface object
 * @param data The data to be included in the response
 * @param message The message to be included in the response
 * @param statusCode The status code to be included in the response
 * @returns A SampleResponseInterface object
 */
export function createSampleResponse<T>(data: T, message: string, statusCode: number): SampleResponseInterface<T> {
    return {
        data,
        message,
        statusCode
    };
}
