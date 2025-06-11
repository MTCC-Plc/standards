import { Injectable } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import * as FormData from "form-data";
import { QueryStorageInput, StorageModuleOptions } from "./storage.interface";

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
        if (err?.response?.data) {
          const e = err.response.data;
          throw new Error(`Storage Service: ${e.message}`);
        } else {
          throw new Error(err);
        }
      });
    return result;
  }

  /**
   * @param file Express.Multer.File object.
   * @returns the uuid of the uploaded file from the storage service.
   * @description
   * Uploads a file to the storage service. The file should be an
   * Express.Multer.File object, which is typically
   */
  async upload(file: Express.Multer.File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });
    const resp = await this.queryStorage<string>({
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
