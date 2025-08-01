import * as SecureStore from "expo-secure-store"

export async function getEncryptionKeyFromKeychain(): Promise<string> {
	let result = await SecureStore.getItemAsync("mmkvEncryptionKey")

	if (result) {
		return result
	} else {
		const key = createKey()
		await SecureStore.setItemAsync("mmkvEncryptionKey", key)
		return key
	}
}

function createKey() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@{}.`%=:;';
	return Array.from({length: 32}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}