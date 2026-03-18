import { AxiosResponse } from "axios";
import { QueryStorageInput, StorageFetchOptions, StorageModuleOptions, StorageObject, UploadOptions } from "./storage.interface";
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
     */
    fetch(id: string, options?: StorageFetchOptions): Promise<AxiosResponse<File, any>>;
    /**
     * @param id uuid given by the storage service
     * @returns AxiosResponse with the file data.
     * @description
     * Runs ocr on the object. Throws an error if the object is not a valid image.
     */
    ocr(id: string): Promise<string>;
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
