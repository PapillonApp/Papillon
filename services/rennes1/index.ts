import { fetch } from "react-native-real-fetch";

class UnivRennes1 {
    private apiUrl: string;

    constructor() {
        this.apiUrl = "https://api.sampleapis.com/coffee/hot";
    }

    async login(username, password) {
        try {
            // Step 1: Get the initial login page to obtain execution token
            const loginPageResponse = await fetch('https://sso-cas.univ-rennes.fr/login?service=https%3A%2F%2Fsesame.univ-rennes.fr%2Fcomptes%2Fapi%2Fauth%2Fcallback', {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
                },
                redirect: 'manual'
            });

            const loginPageHtml = await loginPageResponse.text();

            // Extract execution token from the HTML form
            const executionMatch = loginPageHtml.match(/name="execution" value="([^"]+)"/);
            if (!executionMatch) {
                throw new Error('Could not find execution token in login page');
            }
            const executionToken = executionMatch[1];

            // Step 2: Perform CAS login
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('execution', executionToken);
            formData.append('_eventId', 'submit');
            formData.append('geolocation', '');

            const formDataString = formData.toString();

            const loginResponse = await fetch('https://sso-cas.univ-rennes.fr/login?service=https%3A%2F%2Fsesame.univ-rennes.fr%2Fcomptes%2Fapi%2Fauth%2Fcallback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                    'Origin': 'https://sso-cas.univ-rennes.fr',
                    'Referer': 'https://sso-cas.univ-rennes.fr/login?service=https%3A%2F%2Fsesame.univ-rennes.fr%2Fcomptes%2Fapi%2Fauth%2Fcallback'
                },
                body: formDataString,
                redirect: 'manual'
            });

            // Check if login was successful (should get a 302 redirect)
            if (loginResponse.status !== 302) {
                throw new Error('Login failed - expected 302 redirect');
            }

            const redirectUrl = loginResponse.headers.get('Location');
            if (!redirectUrl) {
                throw new Error('No redirect URL found after login');
            }

            // Step 3: Follow the redirect to complete authentication
            const authCallbackResponse = await fetch(redirectUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                    'Referer': 'https://sso-cas.univ-rennes.fr/'
                },
                redirect: 'manual'
            });

            // Step 4: Follow final redirect to get session cookies
            if (authCallbackResponse.status === 302) {
                const finalRedirect = authCallbackResponse.headers.get('Location');
                if (finalRedirect) {
                    await fetch(finalRedirect, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                            'Referer': 'https://sso-cas.univ-rennes.fr/'
                        }
                    });
                }
            }

            // Step 5: Fetch the API data
            const apiResponse = await fetch('https://sesame.univ-rennes.fr/comptes/api/auth/data', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
                }
            });

            if (!apiResponse.ok) {
                throw new Error(`API request failed with status ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            return data;

        } catch (error) {
            console.error('Error during authentication:', error);
            throw error;
        }
    }
}

export default UnivRennes1;