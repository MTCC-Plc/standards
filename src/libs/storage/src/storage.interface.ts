export interface StorageModuleOptions {
  host: string;
  appKey?: string;
}

export interface StorageModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory?: (
    ...args: unknown[]
  ) => StorageModuleOptions | Promise<StorageModuleOptions>;
}

export interface QueryStorageInput {
  endpoint: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  responseType?: "json" | "arraybuffer" | "text" | "stream";
  /** Statuses that resolve instead of throwing. Defaults to 2xx. */
  validateStatus?: (status: number) => boolean;
}

export interface StorageFetchOptions {
  original?: boolean;
  lossy?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  /**
   * HTTP Range header value, e.g. `bytes=0-1023`. With `serve`, this defaults
   * to the incoming request's Range header so browsers can stream and seek.
   */
  range?: string;
}

export interface TemporaryUrlOptions {
  /**
   * How long the URL stays valid. Defaults to 1 hour, maximum 24 hours. The URL
   * stops working at expiry, including for a video that is already playing, so
   * for video and audio this should cover the expected viewing time.
   */
  expiresInSeconds?: number;
}

export interface TemporaryUrl {
  id: string;
  /** Unauthenticated URL to the object, usable directly as an img/video src. */
  url: string;
  expiresAt: string;
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
