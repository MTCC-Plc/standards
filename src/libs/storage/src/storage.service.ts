import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import * as FormData from "form-data";
import {
  OcrResponse,
  QueryStorageInput,
  StorageModuleOptions,
  StorageObject,
} from "./storage.interface";

@Injectable()
export class StorageService {
  constructor(private readonly config: StorageModuleOptions) {}

  async queryStorage<T>({
    endpoint,
    method,
    body,
    headers,
    responseType = undefined,
  }: QueryStorageInput): Promise<AxiosResponse<T, any>> {
    const h = {
      Authorization: `${this.config.appKey}`,
      "Content-Type": "application/json",
      ...headers,
    };
    const result = await axios
      .request<T>({
        url: `${this.config.host}/${endpoint}`,
        method,
        headers: h,
        data: body,
        responseType,
      })
      .catch((err) => {
        if (err.response) {
          const { status, data } = err.response;
          const errorMessage =
            data?.error || data?.message || `Storage Service Error`;

          switch (status) {
            case 400:
              throw new BadRequestException(`Storage Service: ${errorMessage}`);
            case 401:
              throw new UnauthorizedException(
                `Storage Service: ${errorMessage}`
              );
            case 403:
              throw new ForbiddenException(`Storage Service: ${errorMessage}`);
            case 404:
              throw new NotFoundException(`Storage Service: ${errorMessage}`);
            case 500:
            case 502:
            case 503:
            case 504:
              throw new InternalServerErrorException(
                `Storage Service: ${errorMessage}`
              );
            default:
              throw new HttpException(
                `Storage Service: ${errorMessage}`,
                status
              );
          }
        } else {
          // Network error or other non-HTTP error
          throw new InternalServerErrorException(
            `Storage Service: ${err.message || "Network error"}`
          );
        }
      });
    return result;
  }

  /**
   * @param file Express.Multer.File object.
   * @returns the uploaded storage object from the storage service.
   * @description
   * Uploads a file to the storage service. The file should be an
   * Express.Multer.File object.
   */
  async upload(file: Express.Multer.File): Promise<StorageObject> {
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });
    const resp = await this.queryStorage<StorageObject>({
      endpoint: "s",
      method: "post",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return resp.data;
  }

  /**
   * @param id uuid given by the storage service
   * @returns AxiosResponse with the file data.
   * @description
   * Fetches a file from the storage service by its ID. Recommended to use
   * the serve method instead, which is meant to be used with the Res decorator.
   */
  async fetch(id: string): Promise<AxiosResponse<File, any>> {
    const resp = await this.queryStorage<File>({
      endpoint: `s/${id}`,
      method: "get",
      responseType: "arraybuffer",
    });
    return resp;
  }

  /**
   * @param id uuid given by the storage service
   * @returns AxiosResponse with the file data.
   * @description
   * Runs ocr on the object. Throws an error if the object is not a valid image.
   */
  async ocr(id: string): Promise<string> {
    const resp = await this.queryStorage<OcrResponse>({
      endpoint: `s/${id}/ocr`,
      method: "get",
    });
    return resp.data.text;
  }

  /**
   * @param id uuid given by the storage service
   * @param res response object from express or nestjs given by Res decorator
   *
   * @description
   * Serves a file from the storage service. Meant to be used at the end of the
   * controller method, where you can use the Res decorator.
   */
  async serve(id: string, res: any) {
    const resp = await this.queryStorage<string>({
      endpoint: `s/${id}`,
      method: "get",
      responseType: "arraybuffer",
    });
    res.set({
      "Content-Length": resp.headers["content-length"] ?? "",
      "Content-Disposition": resp.headers["content-disposition"] ?? "",
      "Content-Type":
        resp.headers["content-type"] ?? "application/octet-stream",
      "Cache-Control": resp.headers["cache-control"] ?? "no-cache",
    });
    res.end(resp.data);
  }

  /**
   * @param id uuid given by the storage service
   *
   * @description
   * Deletes a file from the storage service by its ID.
   */
  async delete(id: string) {
    await this.queryStorage<string>({
      endpoint: `s/${id}`,
      method: "delete",
    });
  }
}
