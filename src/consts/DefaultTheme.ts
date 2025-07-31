import {Theme} from "@/utils/chat/themes/Themes.types";

export const DefaultTheme: Theme = {
  meta: {
    name: "Default",
    author: "PapillonApp",
    icon: { uri: "https://play-lh.googleusercontent.com/wpV-VScxugHvexfYPURrkhpCxr1un_eJupTk9rHFf9TKfCBlYcrPoqyaJCVtWlX4Zw"},
    darkIcon: { uri: "https://play-lh.googleusercontent.com/wpV-VScxugHvexfYPURrkhpCxr1un_eJupTk9rHFf9TKfCBlYcrPoqyaJCVtWlX4Zw"},
    path: "default"
  },
  lightModifier: {
    headerBackgroundColor: "#000",
    headerTextColor: "#000000",
    chatBackgroundColor: "#FFF",
    sentMessageBackgroundColor: "#0099D1",
    sentMessageTextColor: "#FFF",
    sentMessageBorderColor: "#00000022",
    sentMessageBorderSize: 0,
    sentMessageborderRadiusDefault: 25,
    sentMessageBorderRadiusLinked: 5,
    receivedMessageBackgroundColor: "#FFF",
    receivedMessageTextColor: "#000",
    receivedMessageBorderColor: "#00000022",
    receivedMessageBorderSize: 1,
    receivedMessageborderRadiusDefault: 25,
    receivedMessageBorderRadiusLinked: 5,
    inputBarBackgroundColor: "#FFF",
    sendButtonBackgroundColor: "#0099D1"
  },
  darkModifier: {
    headerBackgroundColor: "#000",
    headerTextColor: "#FFFFFF",
    chatBackgroundColor: "#000",
    sentMessageBackgroundColor: "#0099D1",
    sentMessageTextColor: "#FFF",
    sentMessageBorderColor: "#FFFFFF22",
    sentMessageBorderSize: 0,
    sentMessageborderRadiusDefault: 25,
    sentMessageBorderRadiusLinked: 5,
    receivedMessageBackgroundColor: "#000",
    receivedMessageTextColor: "#FFF",
    receivedMessageBorderColor: "#FFFFFF22",
    receivedMessageBorderSize: 1,
    receivedMessageborderRadiusDefault: 25,
    receivedMessageBorderRadiusLinked: 5,
    inputBarBackgroundColor: "#000",
    sendButtonBackgroundColor: "#0099D1"
  },
  exclusiveMeta: {
    isExclusive: false
  }
};
