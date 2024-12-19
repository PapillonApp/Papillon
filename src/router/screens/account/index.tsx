import createScreen from "@/router/helpers/create-screen";
import Lessons from "@/views/account/Lessons/Lessons";
import Homeworks from "@/views/account/Homeworks/Homeworks";
import HomeStackScreen from "./home";
import Menu from "@/views/account/Restaurant/Menu";
import NewsScreen from "@/views/account/News/News";
import Grades from "@/views/account/Grades/Grades";
import Attendance from "@/views/account/Attendance/Attendance";
import Messages from "@/views/account/Chat/Messages";
import Evaluation from "@/views/account/Evaluation/Evaluation";

export const screens = [
  createScreen("Home", () => <HomeStackScreen accountScreens={screens} />, {
    headerShown: false,
    tabBarLabel: "Accueil",
    tabBarLottie: require("@/../assets/lottie/tab_home.json"),
  }),
  createScreen("Lessons", Lessons, {
    headerTitle: "Cours",
    headerShown: false,
    tabBarLabel: "Cours",
    tabBarLottie: require("@/../assets/lottie/tab_calendar.json"),
  }),
  createScreen("Homeworks", Homeworks, {
    headerTitle: "Devoirs",
    headerShown: false,
    tabBarLabel: "Devoirs",
    tabBarLottie: require("@/../assets/lottie/tab_book_2.json"),
  }),
  createScreen("Grades", Grades, {
    headerTitle: "Notes",
    headerShown: false,
    tabBarLabel: "Notes",
    tabBarLottie: require("@/../assets/lottie/tab_chart.json"),
  }),
  createScreen("News", NewsScreen, {
    headerTitle: "Actualités",
    tabBarLabel: "Actualités",
    tabBarLottie: require("@/../assets/lottie/tab_news.json"),
  }),
  createScreen("Attendance", Attendance, {
    headerTitle: "Vie scolaire",
    headerShown: false,
    tabBarLabel: "Vie sco.",
    tabBarLottie: require("@/../assets/lottie/tab_check.json"),
  }),
  createScreen("Messages", Messages, {
    headerTitle: "Messages",
    tabBarLabel: "Messages",
    tabBarLottie: require("@/../assets/lottie/tab_chat.json"),
  }),
  createScreen("Menu", Menu, {
    headerTitle: "Cantine",
    tabBarLabel: "Cantine",
    tabBarLottie: require("@/../assets/lottie/tab_pizza.json"),
  }),
  createScreen("Evaluation", Evaluation, {
    headerTitle: "Compétences",
    headerShown: false,
    tabBarLabel: "Compétences",
    tabBarLottie: require("@/../assets/lottie/tab_evaluations.json"),
  }),
] as Array<ReturnType<typeof createScreen>>;

export default screens;