import { ThemesMeta } from "@/utils/chat/themes/Themes.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function DownloadTheme (meta: ThemesMeta): Promise<boolean> {
  let f_theme = await fetch("https://raw.githubusercontent.com/PapillonApp/datasets/themes/main/" + meta.path + "/theme.json");
  let r_theme = await f_theme.json();

  let to_download: string[] = [];
  if (r_theme.darkModifier && r_theme.darkModifier.chatBackgroundImage) {
    to_download.push(r_theme.darkModifier.chatBackgroundImage);
  }
  if (r_theme.lightModifier && r_theme.lightModifier.chatBackgroundImage) {
    to_download.push(r_theme.lightModifier.chatBackgroundImage);
  }
  for (let i = 0; i < to_download.length; i++) {
    let f = await fetch("https://raw.githubusercontent.com/PapillonApp/datasets/themes/refs/heads/main/" + meta.path + "/" + to_download[i]);
    let r = await f.blob();
    let reader = new FileReader();
    reader.readAsDataURL(r);
    reader.onloadend = function () {
      if (reader.result && typeof reader.result === "string") {
        let base64data = reader.result;
        AsyncStorage.setItem("theme_" + meta.name + "_@" + meta.author + "_" + to_download[i], base64data);
        console.log("Asset downloaded to " + "theme_" + meta.name + "_@" + meta.author + "_" + to_download[i]);
      } else {
        console.error("Error: reader.result is not a string or is null.");
      }
    };
  }

  await AsyncStorage.setItem("theme_" + meta.name + "_@" + meta.author, JSON.stringify(r_theme));
  return true;
}

async function SetThemeForChatId (chatId: string, meta: ThemesMeta): Promise<boolean> {
  let themeDownloaded = await DownloadTheme(meta);
  if (!themeDownloaded) {
    console.error("Failed to download the theme for chatId: " + chatId);
    return false;
  }

  if (themeDownloaded) await AsyncStorage.setItem("chat_theme_" + chatId, "theme_" + meta.name + "_@" + meta.author);

  return true;
}

export default SetThemeForChatId;
