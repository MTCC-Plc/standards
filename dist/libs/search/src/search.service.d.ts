import { SearchModuleOptions } from "./search.interface";
export declare class SearchService {
    private readonly searchConfig;
    constructor(searchConfig: SearchModuleOptions);
    queryMeili<T>(endpoint: string, method?: string, body?: any): Promise<T>;
    search(index: string, query: string, filter?: string): Promise<any>;
    deleteAll(index: string): Promise<any>;
    addDocuments(index: string, documents: any[]): Promise<any>;
}
