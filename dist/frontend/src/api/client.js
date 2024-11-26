"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApolloClient = exports.getAdToken = void 0;
const client_1 = require("@apollo/client");
const context_1 = require("@apollo/client/link/context");
const error_1 = require("@apollo/client/link/error");
const msal_react_1 = require("@azure/msal-react");
const antd_1 = require("antd");
const react_1 = require("react");
const react_router_1 = require("react-router");
const messagesToRedirect = [
    "AADSTS50078",
    "consent_required",
    "interaction_required",
    "login_required",
];
const redirectable = (message) => {
    return messagesToRedirect.some((msg) => message.includes(msg));
};
const getAdToken = (instance, account) => __awaiter(void 0, void 0, void 0, function* () {
    if (!account) {
        return ["", new Error("Not logged into AD account.")];
    }
    yield instance.initialize();
    const tokenRequest = {
        scopes: [`${process.env.REACT_APP_AD_CLIENT_ID}/.default`],
        account: account,
    };
    let token;
    try {
        const authResult = yield instance.acquireTokenSilent(tokenRequest);
        token = authResult.accessToken;
        return [token, null];
    }
    catch (e) {
        const message = e === null || e === void 0 ? void 0 : e.message;
        if (message && redirectable(message)) {
            yield instance.acquireTokenRedirect(tokenRequest);
        }
        console.log(e);
        return ["", e];
    }
});
exports.getAdToken = getAdToken;
const useApolloClient = (uri) => {
    const navigate = (0, react_router_1.useNavigate)();
    if (!uri) {
        uri = process.env.REACT_APP_API_URL;
    }
    const [client, setClient] = (0, react_1.useState)(new client_1.ApolloClient({ cache: new client_1.InMemoryCache() }));
    const { instance, accounts } = (0, msal_react_1.useMsal)();
    const account = (0, msal_react_1.useAccount)(accounts[0] || {});
    const httpLink = (0, client_1.createHttpLink)({
        uri,
        credentials: "same-origin",
    });
    const reloadPageWithTimeout = () => {
        const lastReload = localStorage.getItem("lastPageReload");
        const now = new Date().getTime() / 1000;
        if (lastReload) {
            const diffSecs = now - parseInt(lastReload);
            if (!diffSecs || diffSecs < 60)
                return;
        }
        localStorage.setItem("lastPageReload", `${now}`);
        navigate(0);
    };
    (0, react_1.useEffect)(() => {
        if (!account)
            return;
        const getClient = () => __awaiter(void 0, void 0, void 0, function* () {
            const [token, error] = yield (0, exports.getAdToken)(instance, account);
            if (error) {
                antd_1.message.error(error.message);
                return;
            }
            const authLink = (0, context_1.setContext)((_, { headers }) => {
                return {
                    headers: Object.assign(Object.assign({}, headers), { authorization: token ? `Bearer ${token}` : "" }),
                };
            });
            // When API returns unauthenticated, it might mean the token has expired
            // This will cause a page reload to get a new AD token
            // Prevent too many page reloads by saving last page reload time to local
            // storage
            const logoutLink = (0, error_1.onError)(({ graphQLErrors, networkError }) => {
                var _a, _b;
                if (graphQLErrors &&
                    ((_b = (_a = graphQLErrors[0]) === null || _a === void 0 ? void 0 : _a.extensions) === null || _b === void 0 ? void 0 : _b.code) === "UNAUTHENTICATED") {
                    reloadPageWithTimeout();
                }
                console.log(networkError);
            });
            const client = new client_1.ApolloClient({
                link: logoutLink.concat(authLink.concat(httpLink)),
                cache: new client_1.InMemoryCache(),
            });
            setClient(client);
        });
        getClient();
    }, [account === null || account === void 0 ? void 0 : account.username]);
    return client;
};
exports.useApolloClient = useApolloClient;
