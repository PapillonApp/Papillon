// Singleton service to be used anywhere (non-React files included)
export type UrlChangeListener = (url: string) => void;
export type MessageListener = (event: any) => void;

class LoginBrowserService {
    webViewRef: any = null;

    subscribeToUrlChange: (listener: UrlChangeListener) => () => void = () => () => { };
    subscribeToMessage: (listener: MessageListener) => () => void = () => () => { };
    retrieveInnerText: () => Promise<string> = async () => {
        throw new Error("LoginBrowser not ready yet");
    };
    fetch: (url: string) => Promise<string> = async () => {
        throw new Error("LoginBrowser not ready yet");
    };
    resetCookies: () => Promise<void> = async () => {
        throw new Error("LoginBrowser not ready yet");
    };
}

export const loginBrowserService = new LoginBrowserService();
