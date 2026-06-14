export interface StorageModuleOptions {
    host: string;
    appKey?: string;
}
export interface StorageModuleAsyncOptions {
    imports?: any[];
    inject?: any[];
    useFactory?: (...args: unknown[]) => StorageModuleOptions | Promise<StorageModuleOptions>;
}
export interface QueryStorageInput {
    endpoint: string;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    responseType?: "json" | "arraybuffer" | "text";
}
export interface StorageFetchOptions {
    original?: boolean;
    lossy?: boolean;
    quality?: number;
    width?: number;
    height?: number;
}
export interface OcrResponse {
    text: string;
}
export interface ExtractFieldsOptions {
    /** Re-run extraction even if a cached result exists for the same field set. */
    force?: boolean;
}
/** Map of field names to their extracted string values. */
export type ExtractFieldsResult = Record<string, string>;
export interface StorageObject {
    id: string;
    createdAt: string;
    originalName: string;
    appId: number;
    mimeType: string;
    sizeBytes: number;
    ocrResult?: string | Record<string, string>;
}
export interface UploadOptions {
    /** Run plain text OCR on the uploaded file */
    ocr?: boolean;
    /** Run structured field extraction OCR. Keys are field names, values are descriptions. */
    ocrFields?: Record<string, string>;
}
