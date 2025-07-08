import { AxiosResponse } from "axios";
import { QueryStorageInput, StorageModuleOptions } from "./storage.interface";
export declare class StorageService {
    private readonly config;
    constructor(config: StorageModuleOptions);
    queryStorage<T>({ endpoint, method, body, headers, responseType, }: QueryStorageInput): Promise<AxiosResponse<T, any>>;
    /**
     * @param file Express.Multer.File object.
     * @returns the uuid of the uploaded file from the storage service.
     * @description
     * Uploads a file to the storage service. The file should be an
     * Express.Multer.File object, which is typically
     */
    upload(file: Express.Multer.File): Promise<string>;
    /**
     * @param id uuid given by the storage service
     * @returns AxiosResponse with the file data.
     * @description
     * Fetches a file from the storage service by its ID. Recommended to use
     * the serve method instead, which is meant to be used with the Res decorator.
     */
    fetch(id: string): Promise<AxiosResponse<File, any>>;
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
     *
     * @description
     * Serves a file from the storage service. Meant to be used at the end of the
     * controller method, where you can use the Res decorator.
     */
    serve(id: string, res: any): Promise<void>;
    /**
     * @param id uuid given by the storage service
     *
     * @description
     * Deletes a file from the storage service by its ID.
     */
    delete(id: string): Promise<void>;
}
