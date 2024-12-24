import { Injectable } from "@nestjs/common";
import {
  DocumentOptions,
  DocumentsQuery,
  EnqueuedTask,
  MeiliSearch,
} from "meilisearch";
import { InjectSearch } from "./search.decorator";

@Injectable()
export class SearchService {
  constructor(@InjectSearch() private readonly searchClient: MeiliSearch) {}

  async search(index: string, query: string, options?: any): Promise<any> {
    return await this.searchClient.index(index).search(query, options);
  }

  async addDocuments(
    index: string,
    documents: Array<Record<string, any>>,
    options?: DocumentOptions
  ): Promise<EnqueuedTask> {
    return await this.searchClient
      .index(index)
      .addDocuments(documents, options);
  }

  async getDocuments(
    index: string,
    parameters?: DocumentsQuery<Record<string, any>>
  ): Promise<any> {
    return await (
      await this.searchClient.getIndex(index)
    ).getDocuments(parameters);
  }

  async updateDocuments(
    index: string,
    documents: Array<Partial<Record<string, any>>>
  ): Promise<EnqueuedTask> {
    return await this.searchClient.index(index).updateDocuments(documents);
  }

  async deleteDocument(index: string, docId: string): Promise<EnqueuedTask> {
    return await this.searchClient.index(index).deleteDocument(docId);
  }
}
