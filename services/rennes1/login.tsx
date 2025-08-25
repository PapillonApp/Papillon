
import { useLoginBrowser } from "@/layouts/providers/LoginBrowserProvider";
import { Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";

// Custom hook to handle Univ Rennes 1 login
export function useUnivRennes1Login() {
    const loginWebView = useLoginBrowser();

    const login = (username: string, password: string) => {
        let canRetrieveInnerText = false;
        return new Promise((resolve, reject) => {
            try {
                const urlChanged = (url: string) => {
                    if (url.startsWith("https://sso-cas.univ-rennes.fr")) {
                        canRetrieveInnerText = true;
                        loginWebView.webViewRef.current.injectJavaScript(`
                        document.getElementById("username").value = "${username}";
                        document.getElementById("password").value = "${password}";
                        document.getElementsByName("submitBtn")[0].click();
                    `);
                    }

                    if (url === "https://sesame.univ-rennes.fr/comptes/") {
                        loginWebView.fetch("https://sesame.univ-rennes.fr/comptes/api/auth/data");
                    }

                    if (url === "https://sesame.univ-rennes.fr/comptes/api/auth/data") {
                        if (canRetrieveInnerText) {
                            loginWebView.retrieveInnerText().then(innerText => {
                                const data = JSON.parse(innerText);
                                const id = uuid();
                                const account: Account = {
                                    id,
                                    firstName: data.user.infos.firstName ?? "",
                                    lastName: data.user.infos.lastName ?? "",
                                    schoolName: "Université de Rennes",
                                    className: data.caccount.data.attachmentDpt.shortName ?? "",
                                    services: [
                                        {
                                            id: id,
                                            auth: {
                                                additionnals: {
                                                    username: username,
                                                    password: password
                                                }
                                            },
                                            serviceId: Services.RENNES1,
                                            createdAt: (new Date()).toISOString(),
                                            updatedAt: (new Date()).toISOString()
                                        }
                                    ],
                                    createdAt: (new Date()).toISOString(),
                                    updatedAt: (new Date()).toISOString()
                                };
                                resolve(account);
                            });
                        }
                    }
                }

                loginWebView.subscribeToUrlChange((url) => {
                    urlChanged(url);
                });

                loginWebView.resetCookies().then(() => {
                    loginWebView.fetch("https://sesame.univ-rennes.fr/comptes/");
                });
            }
            catch (e) {
                reject(e);
            }
        });
    };

    return { login };
}
