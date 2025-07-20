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
  responseType?: "json" | "arraybuffer" | "text";
}

export interface OcrResponse {
  text: string;
}

export interface StorageObject {
  id: string;
  createdAt: string;
  originalName: string;
  appId: number;
  mimeType: string;
  sizeBytes: number;
}
