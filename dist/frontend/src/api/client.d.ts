import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
export declare const getAdToken: (instance: IPublicClientApplication, account: AccountInfo | null) => Promise<[string, Error | null]>;
export declare const useApolloClient: (uri?: string) => ApolloClient<NormalizedCacheObject>;
