import React, {
	createContext,
	useContext,
	useRef,
	useState,
	RefObject,
	ReactNode,
} from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { loginBrowserService } from "./LoginBrowserService";

type UrlChangeListener = (url: string) => void;
type MessageListener = (event: any) => void;

interface LoginBrowserContextType {
	webViewRef: RefObject<any>;
	subscribeToUrlChange: (listener: UrlChangeListener) => () => void;
	subscribeToMessage: (listener: MessageListener) => () => void;
	retrieveInnerText: () => Promise<string>;
	fetch: (url: string) => Promise<string>;
	resetCookies: () => Promise<void>;
}

const LoginBrowserContext = createContext<LoginBrowserContextType | undefined>(
	undefined
);

interface LoginBrowserProviderProps {
	children: ReactNode;
}

export const LoginBrowserProvider = ({ children }: LoginBrowserProviderProps) => {
	const webViewRef = useRef<any>(null);
	const urlChangeListeners = useRef<Set<UrlChangeListener>>(new Set());
	const messageListeners = useRef<Set<MessageListener>>(new Set());
	const [rerender, setRerender] = useState(0);

	// Reset cookies
	const resetCookies = (): Promise<void> => {
		return new Promise((resolve) => {
			setRerender((prev) => prev + 1);
			webViewRef.current?.reload();
			resolve();
		});
	};

	// Retrieve inner text from DOM
	const retrieveInnerText = (): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (!webViewRef.current) {
				reject(new Error("WebView ref not available"));
				return;
			}
			const messageHandler = (event: any) => {
				try {
					if (event?.nativeEvent?.data?.startsWith("INNER_TEXT:")) {
						const text = event.nativeEvent.data.replace("INNER_TEXT:", "");
						messageListeners.current.delete(messageHandler);
						resolve(text);
					}
				} catch (e) {
					messageListeners.current.delete(messageHandler);
					reject(e);
				}
			};
			messageListeners.current.add(messageHandler);
			webViewRef.current.injectJavaScript(
				`window.ReactNativeWebView.postMessage('INNER_TEXT:' + document.documentElement.innerText); true;`
			);
		});
	};

	// Subscribe to URL change
	const subscribeToUrlChange = (listener: UrlChangeListener) => {
		urlChangeListeners.current.add(listener);
		return () => urlChangeListeners.current.delete(listener);

	};

	// Fetch: load URL + wait + return inner text
	const fetch = (url: string): Promise<string> => {
		console.log(`Fetching URL: ${url}`);

		return new Promise((resolve, reject) => {
			if (!webViewRef.current) {
				reject(new Error("WebView ref not available"));
				return;
			}

			const loadHandler = (navState: any) => {
				const loadedUrl = navState?.nativeEvent?.url;
				if (loadedUrl && loadedUrl.startsWith(url)) {
					urlChangeListeners.current.delete(loadHandler);
					setTimeout(() => {
						retrieveInnerText().then(resolve).catch(reject);
					}, 100);
				}
			};

			urlChangeListeners.current.add(loadHandler);

			webViewRef.current.injectJavaScript(
				`window.location.href = '${url}'; true;`
			);
		});
	};

	// Subscribe to message
	const subscribeToMessage = (listener: MessageListener) => {
		messageListeners.current.add(listener);
		return () => messageListeners.current.delete(listener);
	};

	// Handlers
	const handleNavigationStateChange = (navState: any) => {
		const url = navState?.nativeEvent?.url;
		if (url) {
			urlChangeListeners.current.forEach((listener) =>
				listener(navState.nativeEvent.url)
			);
		}
	};

	const handleMessage = (event: any) => {
		messageListeners.current.forEach((listener) => listener(event));
	};

	// Context value
	const contextValue: LoginBrowserContextType = {
		webViewRef,
		subscribeToUrlChange,
		subscribeToMessage,
		retrieveInnerText,
		fetch,
		resetCookies,
	};

	// 🔗 Sync singleton service so .ts files can call functions
	loginBrowserService.webViewRef = webViewRef;
	loginBrowserService.subscribeToUrlChange = subscribeToUrlChange;
	loginBrowserService.subscribeToMessage = subscribeToMessage;
	loginBrowserService.retrieveInnerText = retrieveInnerText;
	loginBrowserService.fetch = fetch;
	loginBrowserService.resetCookies = resetCookies;

	return (
		<>
			<View
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					width: "100%",
					height: 500,
					zIndex: 10000,
					opacity: 0.1,
				}}
				pointerEvents="none"
			>
				<WebView
					ref={webViewRef}
					onLoadEnd={handleNavigationStateChange}
					onMessage={handleMessage}
					sharedCookiesEnabled={false}
					incognito={true}
					key={"loginWebview:" + rerender}
				/>
			</View>
			<LoginBrowserContext.Provider value={contextValue}>
				{children}
			</LoginBrowserContext.Provider>
		</>
	);
};

// Hook (optional inside React)
export const useLoginBrowser = () => {
	const context = useContext(LoginBrowserContext);
	if (!context) {
		throw new Error("useLoginBrowser must be used within a LoginBrowserProvider");
	}
	return context;
};
