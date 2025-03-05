import { SearchInput, SearchModuleOptions } from "./search.interface";
export declare class SearchService {
    private readonly searchConfig;
    constructor(searchConfig: SearchModuleOptions);
    queryMeili<T>(endpoint: string, method?: string, body?: any): Promise<T>;
    search({ index, query, filter, limit, offset, }: SearchInput): Promise<any>;
    deleteAll(index: string): Promise<any>;
    addDocuments(index: string, documents: any[]): Promise<any>;
}
