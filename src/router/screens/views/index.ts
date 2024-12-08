import createScreen from "@/router/helpers/create-screen";

import NoteReaction from "@/views/account/NoteReaction";
import SettingsTabs from "@/views/settings/SettingsTabs";
import RestaurantQrCode from "@/views/account/Restaurant/Modals/QrCode";
import NewsItem from "@/views/account/News/Document";
import AddonLogs from "@/views/addon/AddonLogs";
import AddonPage from "@/views/addon/AddonPage";
import GradeSubjectScreen from "@/views/account/Grades/Modals/Subject";
import GradeDocument from "@/views/account/Grades/Document";
import RestaurantHistory from "@/views/account/Restaurant/Modals/History";
import ChatCreate from "@/views/account/Chat/Modals/ChatCreate";
import Chat from "@/views/account/Chat/Modals/Chat";
import HomeworksDocument from "@/views/account/Homeworks/Document";
import LessonsImportIcal from "@/views/account/Lessons/Options/LessonsImportIcal";
import LessonDocument from "@/views/account/Lessons/Document";
import BackgroundIUTLannion from "@/views/login/IdentityProvider/actions/BackgroundIUTLannion";
import { Platform } from "react-native";

export default [
  createScreen("NoteReaction", NoteReaction, {
    headerTitle: "",
    headerTransparent: true,
    presentation: "modal",
    animation: "slide_from_bottom",
  }),
  createScreen("RestaurantQrCode", RestaurantQrCode, {
    headerTitle: "",
    headerTransparent: true,
    presentation: "fullScreenModal",
    animation: "slide_from_bottom",
  }),
  createScreen("RestaurantHistory", RestaurantHistory, {
    headerTitle: "",
    headerTransparent: true,
    presentation: "modal",
    animation: "slide_from_bottom",
  }),
  createScreen("SettingsTabs", SettingsTabs, {
    headerTitle: "Onglets et navigation",
    animation: "slide_from_right",
  }),
  createScreen("NewsItem", NewsItem, {
    headerTitle: "Item",
    presentation: "modal",
    headerShown: false,
    animation: "slide_from_right",
  }),
  createScreen("AddonLogs", AddonLogs, {
    headerTitle: "Logs",
    presentation: "modal",
    animation: "slide_from_right",
  }),
  createScreen("AddonPage", AddonPage, {
    headerTitle: "Extension",
    animation: "slide_from_right",
  }),
  createScreen("LessonsImportIcal", LessonsImportIcal, {
    headerTitle: "Importer un iCal",
    presentation: "modal",
    headerLargeTitle: true,
    animation: "slide_from_bottom",
  }),
  createScreen("LessonDocument", LessonDocument, {
    headerTitle: "Cours",
    presentation: "modal",
    headerShown: false,
    animation: "slide_from_bottom",
  }),
  createScreen("HomeworksDocument", HomeworksDocument, {
    headerTitle: "Devoir",
    presentation: "modal",
    headerShown: false,
    animation: "slide_from_bottom",
  }),
  createScreen("GradeSubject", GradeSubjectScreen, {
    headerTitle: "Détail de la matière",
    presentation: "modal",
    animation: "slide_from_right",
  }),
  createScreen("GradeDocument", GradeDocument, {
    headerTitle: "Détail de la note",
    presentation: "modal",
    headerShown: Platform.OS !== "ios",
    animation: "slide_from_right",
  }),
  createScreen("ChatCreate", ChatCreate, {
    headerTitle: "Nouvelle discussion",
    presentation: "modal",
    animation: "slide_from_bottom",
  }),
  createScreen("Chat", Chat, {
    presentation: "modal",
    headerShown: false,
    animation: "slide_from_bottom",
  }),
  createScreen("BackgroundIUTLannion", BackgroundIUTLannion, {
    headerTitle: "IUT de Lannion",
    presentation: "modal",
    animation: "slide_from_right",
  }),
] as const;
