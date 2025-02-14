import { Injectable } from "@nestjs/common";
import axios from "axios";
import { SearchModuleOptions } from "./search.interface";

@Injectable()
export class SearchService {
  constructor(private readonly searchConfig: SearchModuleOptions) {}

  async queryMeili<T>(
    endpoint: string,
    method: string = "get",
    body?: any
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${this.searchConfig.apiKey}`,
      "Content-Type": "application/json",
    };
    const result = await axios
      .request<T>({
        url: `${this.searchConfig.host}/${endpoint}`,
        method,
        headers,
        data: body,
      })
      .catch((err) => {
        if (err?.response?.data) {
          const e = err.response.data;
          throw new Error(`MeiliSearch-API: ${e.message}`);
        } else {
          throw new Error(err);
        }
      });
    return result.data;
  }

  async search(index: string, query: string): Promise<any> {
    const res = await this.queryMeili(
      `indexes/${index}/search?q=${query}`,
      "get"
    );
    return res;
  }

  async deleteAll(index: string): Promise<any> {
    await this.queryMeili(`indexes/${index}/documents`, "delete");
  }

  async addDocuments(index: string, documents: any[]): Promise<any> {
    await this.queryMeili(`indexes/${index}/documents`, "put", documents);
  }
}
