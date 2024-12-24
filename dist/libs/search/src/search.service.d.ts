import { DocumentOptions, DocumentsQuery, EnqueuedTask, MeiliSearch } from "meilisearch";
export declare class SearchService {
    private readonly searchClient;
    constructor(searchClient: MeiliSearch);
    search(index: string, query: string, options?: any): Promise<any>;
    addDocuments(index: string, documents: Array<Record<string, any>>, options?: DocumentOptions): Promise<EnqueuedTask>;
    getDocuments(index: string, parameters?: DocumentsQuery<Record<string, any>>): Promise<any>;
    updateDocuments(index: string, documents: Array<Partial<Record<string, any>>>): Promise<EnqueuedTask>;
    deleteDocument(index: string, docId: string): Promise<EnqueuedTask>;
}
