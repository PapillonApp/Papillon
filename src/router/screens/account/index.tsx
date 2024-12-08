import createScreen from "@/router/helpers/create-screen";
import Lessons from "@/views/account/Lessons/Lessons";
import Homeworks from "@/views/account/Homeworks/Homeworks";
import HomeStackScreen from "./home";
import Menu from "@/views/account/Restaurant/Menu";
import NewsScreen from "@/views/account/News/News";
import Grades from "@/views/account/Grades/Grades";
import Attendance from "@/views/account/Attendance/Attendance";
import Messages from "@/views/account/Chat/Messages";
import { Platform } from "react-native";

const animation = Platform.OS === "android" ? "slide_from_bottom" : "none";

export const screens = [
  createScreen("Home", () => <HomeStackScreen accountScreens={screens} />, {
    headerShown: false,
    tabBarLabel: "Accueil",
    tabBarLottie: require("@/../assets/lottie/tab_home.json"),
    animation: "none",
  }),
  createScreen("Lessons", Lessons, {
    headerTitle: "Cours",
    headerShown: false,
    tabBarLabel: "Cours",
    tabBarLottie: require("@/../assets/lottie/tab_calendar.json"),
    animation,
  }),
  createScreen("Homeworks", Homeworks, {
    headerTitle: "Devoirs",
    headerShown: false,
    tabBarLabel: "Devoirs",
    tabBarLottie: require("@/../assets/lottie/tab_book_2.json"),
    animation,
  }),
  createScreen("Grades", Grades, {
    headerTitle: "Notes",
    headerShown: false,
    tabBarLabel: "Notes",
    tabBarLottie: require("@/../assets/lottie/tab_chart.json"),
    animation,
  }),
  createScreen("News", NewsScreen, {
    headerTitle: "Actualités",
    tabBarLabel: "Actualités",
    tabBarLottie: require("@/../assets/lottie/tab_news.json"),
    animation,
  }),
  createScreen("Attendance", Attendance, {
    headerTitle: "Vie scolaire",
    headerShown: false,
    tabBarLabel: "Vie sco.",
    tabBarLottie: require("@/../assets/lottie/tab_check.json"),
    animation,
  }),
  createScreen("Messages", Messages, {
    headerTitle: "Messages",
    tabBarLabel: "Messages",
    tabBarLottie: require("@/../assets/lottie/tab_chat.json"),
    animation,
  }),
  createScreen("Menu", Menu, {
    headerTitle: "Cantine",
    tabBarLabel: "Cantine",
    tabBarLottie: require("@/../assets/lottie/tab_pizza.json"),
    animation,
  }),
] as Array<ReturnType<typeof createScreen>>;

export default screens;
