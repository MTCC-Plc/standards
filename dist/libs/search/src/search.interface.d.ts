export interface SearchModuleOptions {
    host: string;
    apiKey?: string;
    headers?: object;
}
export interface SearchModuleAsyncOptions {
    useFactory?: (...args: unknown[]) => SearchModuleOptions | Promise<SearchModuleOptions>;
}
export interface SearchInput {
    index: string;
    query: string;
    filter?: string;
    limit?: number;
    offset?: number;
}
