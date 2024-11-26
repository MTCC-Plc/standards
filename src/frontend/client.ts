import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import { useAccount, useMsal } from "@azure/msal-react";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const messagesToRedirect = [
  "AADSTS50078",
  "consent_required",
  "interaction_required",
  "login_required",
];
const redirectable = (message: string) => {
  return messagesToRedirect.some((msg) => message.includes(msg));
};

export const getAdToken = async (
  instance: IPublicClientApplication,
  account: AccountInfo | null
): Promise<[string, Error | null]> => {
  if (!account) {
    return ["", new Error("Not logged into AD account.")];
  }
  await instance.initialize();
  const tokenRequest = {
    scopes: [`${process.env.REACT_APP_AD_CLIENT_ID}/.default`],
    account: account,
  };
  let token: string;
  try {
    const authResult = await instance.acquireTokenSilent(tokenRequest);
    token = authResult.accessToken;
    return [token, null];
  } catch (e: any) {
    const message = e?.message;
    if (message && redirectable(message)) {
      await instance.acquireTokenRedirect(tokenRequest);
    }
    console.log(e);
    return ["", e];
  }
};

export const useApolloClient = (uri?: string) => {
  const navigate = useNavigate();

  if (!uri) {
    uri = process.env.REACT_APP_API_URL;
  }

  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>(
    new ApolloClient({ cache: new InMemoryCache() })
  );

  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const httpLink = createHttpLink({
    uri,
    credentials: "same-origin",
  });

  const reloadPageWithTimeout = () => {
    const lastReload = localStorage.getItem("lastPageReload");
    const now = new Date().getTime() / 1000;
    if (lastReload) {
      const diffSecs = now - parseInt(lastReload);
      if (!diffSecs || diffSecs < 60) return;
    }
    localStorage.setItem("lastPageReload", `${now}`);
    navigate(0);
  };

  useEffect(() => {
    if (!account) return;
    const getClient = async () => {
      const [token, error] = await getAdToken(instance, account);
      if (error) {
        message.error(error.message);
        return;
      }

      const authLink = setContext((_, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          },
        };
      });

      // When API returns unauthenticated, it might mean the token has expired
      // This will cause a page reload to get a new AD token
      // Prevent too many page reloads by saving last page reload time to local
      // storage
      const logoutLink = onError(({ graphQLErrors, networkError }) => {
        if (
          graphQLErrors &&
          graphQLErrors[0]?.extensions?.code === "UNAUTHENTICATED"
        ) {
          reloadPageWithTimeout();
        }
        console.log(networkError);
      });

      const client = new ApolloClient({
        link: logoutLink.concat(authLink.concat(httpLink)),
        cache: new InMemoryCache(),
      });
      setClient(client);
    };

    getClient();
  }, [account?.username]);

  return client;
};
