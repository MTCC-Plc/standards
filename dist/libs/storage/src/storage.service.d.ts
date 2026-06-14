import { AxiosResponse } from "axios";
import { ExtractFieldsOptions, ExtractFieldsResult, QueryStorageInput, StorageFetchOptions, StorageModuleOptions, StorageObject, UploadOptions } from "./storage.interface";
export declare class StorageService {
    private readonly config;
    constructor(config: StorageModuleOptions);
    private buildObjectEndpoint;
    queryStorage<T>({ endpoint, method, body, headers, responseType, }: QueryStorageInput): Promise<AxiosResponse<T, any>>;
    /**
     * @param file Express.Multer.File object.
     * @param options optional OCR options to run during upload.
     * @returns the uploaded storage object from the storage service.
     * @description
     * Uploads a file to the storage service. The file should be an
     * Express.Multer.File object.
     *
     * Supported options:
     * - `ocr: true` runs plain text OCR on the file after upload.
     * - `ocrFields` runs structured field extraction. Pass a map of field names to descriptions.
     *
     * When OCR options are provided, the result is returned in `ocrResult`.
     */
    upload(file: Express.Multer.File, options?: UploadOptions): Promise<StorageObject>;
    /**
     * @param id uuid given by the storage service
     * @param options optional transformation controls for image responses
     * @returns AxiosResponse with the file data.
     * @description
     * Fetches a file from the storage service by its ID. Recommended to use
     * the serve method instead, which is meant to be used with the Res decorator.
     *
     * Supported options:
     * - `original: true` serves the original stored object without WebP conversion.
     * - `lossy: true` forces lossy WebP for PNGs, which are otherwise lossless by default.
     * - `quality` sets WebP quality for lossy responses. Default is 80.
     * - `width` and `height` can be added for resizing images. Can only be resized
     *   down, not up. If only one is provided, the other will be auto-scaled to
     *   preserve aspect ratio.
     */
    fetch(id: string, options?: StorageFetchOptions): Promise<AxiosResponse<File, any>>;
    /**
     * @param id uuid given by the storage service
     * @returns the plain text extracted from the object.
     * @description
     * Runs plain text OCR on the object. Only applicable to images and PDFs.
     * Throws an error if the object is not a supported type. The result is
     * cached on the object, so repeat calls return the stored text.
     */
    ocr(id: string): Promise<string>;
    /**
     * @param id uuid given by the storage service
     * @param fields map of field names to descriptions of what to extract
     * @param options optional extraction controls
     * @returns a map of the requested field names to their extracted values.
     * @description
     * Runs structured field extraction on an existing object. Only applicable to
     * images and PDFs. Throws an error if the object is not a supported type.
     *
     * Results are cached per object and field set. Pass `force: true` to bypass
     * the cache and re-run extraction.
     */
    extract(id: string, fields: Record<string, string>, options?: ExtractFieldsOptions): Promise<ExtractFieldsResult>;
    /**
     * @param id uuid given by the storage service
     * @param res response object from express or nestjs given by Res decorator
     * @param options optional transformation controls for image responses
     *
     * @description
     * Serves a file from the storage service. Meant to be used at the end of the
     * controller method, where you can use the Res decorator.
     *
     * Supported options:
     * - `original: true` serves the original stored object without WebP conversion.
     * - `lossy: true` forces lossy WebP for PNGs, which are otherwise lossless by default.
     * - `quality` sets WebP quality for lossy responses. Default is 80.
     * - `width` and `height` can be added for resizing images. Can only be resized
     *   down, not up. If only one is provided, the other will be auto-scaled to
     *   preserve aspect ratio.
     */
    serve(id: string, res: any, options?: StorageFetchOptions): Promise<void>;
    /**
     * @param id uuid given by the storage service
     *
     * @description
     * Deletes a file from the storage service by its ID.
     */
    delete(id: string): Promise<void>;
}
