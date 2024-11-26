import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
export declare const getAdToken: (instance: IPublicClientApplication, account: AccountInfo | null) => Promise<[string, Error | null]>;
interface ApolloClientOptions {
    uri?: string;
    messagePopup: any;
}
/**
 *
 * @param {ApolloClientOptions} options - The options object for the Apollo Client
 * @param {string} options.uri - The URI of the API to be passed to Apollo Client
 * @param {any} options.messagePopup - The message popup function, for example the 'message' function from antd
 * @returns {ApolloClient<NormalizedCacheObject>} The Apollo Client object
 */
export declare const useApolloClient: ({ uri, messagePopup }: ApolloClientOptions) => ApolloClient<NormalizedCacheObject>;
export {};
