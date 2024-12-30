import {Theme} from "@/utils/chat/themes/Themes.types";
import {DefaultTheme} from "@/consts/DefaultTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function GetThemeForChatId (chatId: string): Promise<Theme> {
  //Just a stupid way to clone an object
  let theme: Theme = JSON.parse(JSON.stringify(DefaultTheme));

  //Get theme from AsyncStorage
  let themeName = await AsyncStorage.getItem("chat_theme_" + chatId);
  if (themeName === null) return theme;

  //Get theme.json from AsyncStorage
  let theme_json_str = await AsyncStorage.getItem(themeName);
  if (theme_json_str === null) return theme;

  //Parse theme.json
  let theme_json = JSON.parse(theme_json_str);

  //Set theme metadata
  theme.meta.name = theme_json.meta.name;
  theme.meta.author = theme_json.meta.author;
  theme.meta.path = theme_json.meta.path;
  theme.meta.icon = theme_json.meta.icon;
  theme.meta.darkIcon = theme_json.meta.darkIcon;

  //Set theme light mode
  theme.lightModifier.headerBackgroundColor = theme_json.lightModifier.headerBackgroundColor || theme.lightModifier.headerBackgroundColor;
  theme.lightModifier.headerTextColor = theme_json.lightModifier.headerTextColor || theme.lightModifier.headerTextColor;

  theme.lightModifier.chatBackgroundColor = theme_json.lightModifier.chatBackgroundColor || theme.lightModifier.chatBackgroundColor;

  if (theme_json.lightModifier.chatBackgroundImage) {
    let image = await AsyncStorage.getItem("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.lightModifier.chatBackgroundImage);
    console.log("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.lightModifier.chatBackgroundImage);
    if (image !== null) {
      theme.lightModifier.chatBackgroundImage = image;
    }
  }

  theme.lightModifier.sentMessageBackgroundColor = theme_json.lightModifier.sentMessageBackgroundColor || theme.lightModifier.sentMessageBackgroundColor;
  theme.lightModifier.sentMessageTextColor = theme_json.lightModifier.sentMessageTextColor || theme.lightModifier.sentMessageTextColor;
  theme.lightModifier.sentMessageBorderColor = theme_json.lightModifier.sentMessageBorderColor || theme.lightModifier.sentMessageBorderColor;
  theme.lightModifier.sentMessageBorderSize = theme_json.lightModifier.sentMessageBorderSize || theme.lightModifier.sentMessageBorderSize;
  theme.lightModifier.sentMessageborderRadiusDefault = theme_json.lightModifier.sentMessageborderRadiusDefault || theme.lightModifier.sentMessageborderRadiusDefault;
  theme.lightModifier.sentMessageBorderRadiusLinked = theme_json.lightModifier.sentMessageBorderRadiusLinked || theme.lightModifier.sentMessageBorderRadiusLinked;

  theme.lightModifier.receivedMessageBackgroundColor = theme_json.lightModifier.receivedMessageBackgroundColor || theme.lightModifier.receivedMessageBackgroundColor;
  theme.lightModifier.receivedMessageTextColor = theme_json.lightModifier.receivedMessageTextColor || theme.lightModifier.receivedMessageTextColor;
  theme.lightModifier.receivedMessageBorderColor = theme_json.lightModifier.receivedMessageBorderColor || theme.lightModifier.receivedMessageBorderColor;
  theme.lightModifier.receivedMessageBorderSize = theme_json.lightModifier.receivedMessageBorderSize || theme.lightModifier.receivedMessageBorderSize;
  theme.lightModifier.receivedMessageborderRadiusDefault = theme_json.lightModifier.receivedMessageborderRadiusDefault || theme.lightModifier.receivedMessageborderRadiusDefault;
  theme.lightModifier.receivedMessageBorderRadiusLinked = theme_json.lightModifier.receivedMessageBorderRadiusLinked || theme.lightModifier.receivedMessageBorderRadiusLinked;

  theme.lightModifier.inputBarBackgroundColor = theme_json.lightModifier.inputBarBackgroundColor || theme.lightModifier.inputBarBackgroundColor;
  theme.lightModifier.sendButtonBackgroundColor = theme_json.lightModifier.sendButtonBackgroundColor || theme.lightModifier.sendButtonBackgroundColor;

  //Set theme dark mode
  theme.darkModifier.headerBackgroundColor = theme_json.darkModifier.headerBackgroundColor || theme_json.lightModifier.headerBackgroundColor || theme.darkModifier.headerBackgroundColor;
  theme.darkModifier.headerTextColor = theme_json.darkModifier.headerTextColor || theme_json.lightModifier.headerTextColor || theme.darkModifier.headerTextColor;

  theme.darkModifier.chatBackgroundColor = theme_json.darkModifier.chatBackgroundColor || theme_json.lightModifier.chatBackgroundColor || theme.darkModifier.chatBackgroundColor;
  if (theme_json.darkModifier.chatBackgroundImage) {
    let image = await AsyncStorage.getItem("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.darkModifier.chatBackgroundImage);
    if (image !== null) {
      theme.darkModifier.chatBackgroundImage = image;
    }
  } else if (theme_json.lightModifier.chatBackgroundImage) {
    theme.darkModifier.chatBackgroundImage = theme_json.lightModifier.chatBackgroundImage;
  }

  theme.darkModifier.sentMessageBackgroundColor = theme_json.darkModifier.sentMessageBackgroundColor || theme_json.lightModifier.sentMessageBackgroundColor || theme.darkModifier.sentMessageBackgroundColor;
  theme.darkModifier.sentMessageTextColor = theme_json.darkModifier.sentMessageTextColor || theme_json.lightModifier.sentMessageTextColor || theme.darkModifier.sentMessageTextColor;
  theme.darkModifier.sentMessageBorderColor = theme_json.darkModifier.sentMessageBorderColor || theme_json.lightModifier.sentMessageBorderColor || theme.darkModifier.sentMessageBorderColor;
  theme.darkModifier.sentMessageBorderSize = theme_json.darkModifier.sentMessageBorderSize || theme_json.lightModifier.sentMessageBorderSize || theme.darkModifier.sentMessageBorderSize;
  theme.darkModifier.sentMessageborderRadiusDefault = theme_json.darkModifier.sentMessageborderRadiusDefault || theme_json.lightModifier.sentMessageborderRadiusDefault || theme.darkModifier.sentMessageborderRadiusDefault;
  theme.darkModifier.sentMessageBorderRadiusLinked = theme_json.darkModifier.sentMessageBorderRadiusLinked || theme_json.lightModifier.sentMessageBorderRadiusLinked || theme.darkModifier.sentMessageBorderRadiusLinked;

  theme.darkModifier.receivedMessageBackgroundColor = theme_json.darkModifier.receivedMessageBackgroundColor || theme_json.lightModifier.receivedMessageBackgroundColor || theme.darkModifier.receivedMessageBackgroundColor;
  theme.darkModifier.receivedMessageTextColor = theme_json.darkModifier.receivedMessageTextColor || theme_json.lightModifier.receivedMessageTextColor || theme.darkModifier.receivedMessageTextColor;
  theme.darkModifier.receivedMessageBorderColor = theme_json.darkModifier.receivedMessageBorderColor || theme_json.lightModifier.receivedMessageBorderColor || theme.darkModifier.receivedMessageBorderColor;
  theme.darkModifier.receivedMessageBorderSize = theme_json.darkModifier.receivedMessageBorderSize || theme_json.lightModifier.receivedMessageBorderSize || theme.darkModifier.receivedMessageBorderSize;
  theme.darkModifier.receivedMessageborderRadiusDefault = theme_json.darkModifier.receivedMessageborderRadiusDefault || theme_json.lightModifier.receivedMessageborderRadiusDefault || theme.darkModifier.receivedMessageborderRadiusDefault;
  theme.darkModifier.receivedMessageBorderRadiusLinked = theme_json.darkModifier.receivedMessageBorderRadiusLinked || theme_json.lightModifier.receivedMessageBorderRadiusLinked || theme.darkModifier.receivedMessageBorderRadiusLinked;

  theme.darkModifier.inputBarBackgroundColor = theme_json.darkModifier.inputBarBackgroundColor || theme_json.lightModifier.inputBarBackgroundColor || theme.darkModifier.inputBarBackgroundColor;
  theme.darkModifier.sendButtonBackgroundColor = theme_json.darkModifier.sendButtonBackgroundColor || theme_json.lightModifier.sendButtonBackgroundColor || theme.darkModifier.sendButtonBackgroundColor;

  return theme;
}

export default GetThemeForChatId;