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
import { pipeline, Readable } from "stream";
import {
  ExtractFieldsOptions,
  ExtractFieldsResult,
  OcrResponse,
  QueryStorageInput,
  StorageFetchOptions,
  StorageModuleOptions,
  StorageObject,
  TemporaryUrl,
  TemporaryUrlOptions,
  UploadOptions,
} from "./storage.interface";

/** Response headers from the storage service that `serve` passes through. */
const SERVE_PASSTHROUGH_HEADERS = [
  "content-length",
  "content-disposition",
  "content-type",
  "cache-control",
  "accept-ranges",
  "content-range",
  "etag",
];

/**
 * Error bodies arrive as a buffer or stream for non-JSON response types, so
 * they are decoded here to recover the storage service's error message.
 */
async function parseErrorData(data: any): Promise<any> {
  try {
    if (data instanceof Readable) {
      data = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        data.on("data", (chunk: any) => chunks.push(Buffer.from(chunk)));
        data.on("end", () => resolve(Buffer.concat(chunks)));
        data.on("error", reject);
      });
    }
    if (data instanceof ArrayBuffer) {
      data = Buffer.from(data);
    }
    if (Buffer.isBuffer(data)) {
      data = JSON.parse(data.toString("utf8"));
    }
    return data;
  } catch {
    return undefined;
  }
}

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
    validateStatus = undefined,
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
        // an explicit undefined would disable axios' default 2xx check
        ...(validateStatus ? { validateStatus } : {}),
      })
      .catch(async (err) => {
        if (err.response) {
          const { status } = err.response;
          const data = await parseErrorData(err.response.data);
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
   * - `range` fetches only part of the object, e.g. `bytes=0-1023`. The
   *   response status is 206 when the range is applied.
   */
  async fetch(
    id: string,
    options?: StorageFetchOptions,
  ): Promise<AxiosResponse<File, any>> {
    const resp = await this.queryStorage<File>({
      endpoint: this.buildObjectEndpoint(id, options),
      method: "get",
      responseType: "arraybuffer",
      headers: options?.range ? { Range: options.range } : undefined,
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
   * The file is streamed through without being buffered in memory. The
   * incoming request's Range, If-Range and If-None-Match headers are forwarded,
   * so browsers can stream and seek in video and audio, and HEAD requests are
   * answered without downloading the file.
   *
   * Supported options:
   * - `original: true` serves the original stored object without WebP conversion.
   * - `lossy: true` forces lossy WebP for PNGs, which are otherwise lossless by default.
   * - `quality` sets WebP quality for lossy responses. Default is 80.
   * - `width` and `height` can be added for resizing images. Can only be resized
   *   down, not up. If only one is provided, the other will be auto-scaled to
   *   preserve aspect ratio.
   * - `range` overrides the incoming request's Range header.
   */
  async serve(id: string, res: any, options?: StorageFetchOptions) {
    // express exposes the request as res.req
    const req = res.req;
    const incoming: Record<string, string | undefined> = req?.headers ?? {};
    const headers: Record<string, string> = {};
    if (options?.range) {
      headers.Range = options.range;
    } else if (incoming.range) {
      headers.Range = incoming.range;
      if (incoming["if-range"]) {
        headers["If-Range"] = incoming["if-range"];
      }
    }
    if (incoming["if-none-match"]) {
      headers["If-None-Match"] = incoming["if-none-match"];
    }
    const method = req?.method === "HEAD" ? "head" : "get";

    const resp = await this.queryStorage<Readable>({
      endpoint: this.buildObjectEndpoint(id, options),
      method,
      headers,
      responseType: "stream",
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 304 || status === 416,
    });

    const outgoing: Record<string, string> = {};
    for (const name of SERVE_PASSTHROUGH_HEADERS) {
      const value = resp.headers[name];
      if (value !== undefined && value !== null) {
        outgoing[name] = `${value}`;
      }
    }
    if (resp.status !== 304) {
      outgoing["content-type"] ??= "application/octet-stream";
      outgoing["cache-control"] ??= "no-cache";
    }
    res.status(resp.status);
    res.set(outgoing);

    const body = resp.data;
    if (method === "head" || resp.status === 304) {
      body.destroy();
      res.end();
      return;
    }
    // Resolves once the response finishes or the client disconnects (e.g. a
    // video player seeking); in both cases the upstream request is closed.
    await new Promise<void>((resolve) => {
      pipeline(body, res, () => resolve());
    });
  }

  /**
   * @param id uuid given by the storage service
   * @param options optional expiry for the URL
   * @returns an unauthenticated URL to the object and when it expires.
   * @description
   * Creates a temporary public URL for an object. The URL needs no app key, so
   * it can be used directly by browsers, e.g. as the src of a video, audio or
   * img element, and supports streaming and seeking. Anyone with the URL can
   * access the object until it expires, so only hand it to users who are
   * allowed to view the object.
   *
   * For Backblaze B2 apps the URL redirects to a pre-signed B2 URL with the
   * same expiry, so the file is downloaded straight from B2. Images converted
   * to WebP, and SharePoint apps, are served by the storage service.
   */
  async temporaryUrl(
    id: string,
    options?: TemporaryUrlOptions,
  ): Promise<TemporaryUrl> {
    const resp = await this.queryStorage<{
      id: string;
      path: string;
      expiresAt: string;
    }>({
      endpoint: `s/${id}/temp`,
      method: "post",
      body: { expiresInSeconds: options?.expiresInSeconds },
    });
    return {
      id: resp.data.id,
      url: `${this.config.host}/${resp.data.path}`,
      expiresAt: resp.data.expiresAt,
    };
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
