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
  ExtractFieldsOptions,
  ExtractFieldsResult,
  OcrResponse,
  QueryStorageInput,
  StorageFetchOptions,
  StorageModuleOptions,
  StorageObject,
  UploadOptions,
} from "./storage.interface";

@Injectable()
export class StorageService {
  constructor(private readonly config: StorageModuleOptions) {}

  private buildObjectEndpoint(id: string, options?: StorageFetchOptions) {
    const params = new URLSearchParams();

    if (options?.original) {
      params.set("original", "true");
    }
    if (options?.lossy) {
      params.set("lossy", "true");
    }
    if (options?.quality !== undefined) {
      params.set("quality", `${options.quality}`);
    }
    if (options?.width !== undefined) {
      params.set("width", `${options.width}`);
    }
    if (options?.height !== undefined) {
      params.set("height", `${options.height}`);
    }

    const query = params.toString();
    return query ? `s/${id}?${query}` : `s/${id}`;
  }

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
                `Storage Service: ${errorMessage}`,
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
                `Storage Service: ${errorMessage}`,
              );
            default:
              throw new HttpException(
                `Storage Service: ${errorMessage}`,
                status,
              );
          }
        } else {
          // Network error or other non-HTTP error
          throw new InternalServerErrorException(
            `Storage Service: ${err.message || "Network error"}`,
          );
        }
      });
    return result;
  }

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
  async upload(
    file: Express.Multer.File,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });
    if (options?.ocrFields) {
      formData.append("ocrFields", JSON.stringify(options.ocrFields));
    } else if (options?.ocr) {
      formData.append("ocr", "true");
    }
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
  async fetch(
    id: string,
    options?: StorageFetchOptions,
  ): Promise<AxiosResponse<File, any>> {
    const resp = await this.queryStorage<File>({
      endpoint: this.buildObjectEndpoint(id, options),
      method: "get",
      responseType: "arraybuffer",
    });
    return resp;
  }

  /**
   * @param id uuid given by the storage service
   * @returns the plain text extracted from the object.
   * @description
   * Runs plain text OCR on the object. Only applicable to images and PDFs.
   * Throws an error if the object is not a supported type. The result is
   * cached on the object, so repeat calls return the stored text.
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
  async extract(
    id: string,
    fields: Record<string, string>,
    options?: ExtractFieldsOptions,
  ): Promise<ExtractFieldsResult> {
    const resp = await this.queryStorage<ExtractFieldsResult>({
      endpoint: `s/${id}/ocr/extract`,
      method: "post",
      body: { fields, force: options?.force },
    });
    return resp.data;
  }

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
  async serve(id: string, res: any, options?: StorageFetchOptions) {
    const resp = await this.queryStorage<string>({
      endpoint: this.buildObjectEndpoint(id, options),
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
