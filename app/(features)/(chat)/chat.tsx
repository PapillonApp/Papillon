import { ScrollView } from "react-native";
import List from "@/ui/components/List";
import Item, { Leading } from "@/ui/components/Item";
import Avatar from "@/ui/components/Avatar";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import { getInitials } from "@/utils/chats/initials";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const DemoData = [
  {
    recipientName: "LECLERC C.",
    lastMessageDate: new Date(Date.now()),
    subject: "Séance de yoga pour les élèves",
    message: "Bonjour, je voulais vous informer que nous organiserons une séance de yoga pour les élèves le vendredi 15 septembre à 16h00 dans la salle polyvalente. Veuillez vous assurer que votre enfant apporte un tapis de yoga et une bouteille d'eau. Merci ! Namaste !",
  },
  {
    recipientName: "MARTIN P.",
    lastMessageDate: new Date(Date.now() - 5 * 60000),
    subject: "Réunion parents-professeurs",
    message: "Chers parents, nous vous invitons à une réunion parents-professeurs le lundi 18 septembre à 18h00 dans la salle des professeurs. Ce sera l'occasion de discuter du programme scolaire et des activités à venir. Votre présence est fortement encouragée. Sinon on vous goumme !",
  },
  {
    recipientName: "DUPONT S.",
    lastMessageDate: new Date(Date.now() - 65 * 60000),
    subject: "Sortie scolaire au musée",
    message: "Bonjour, nous organisons une sortie scolaire au musée d'art moderne le mercredi 20 septembre. Les élèves auront l'occasion de découvrir des œuvres d'art contemporaines et de participer à des ateliers créatifs. Veuillez remplir le formulaire de consentement joint et le retourner avant le 15 septembre. Merci !",
  },
  {
    recipientName: "BERTRAND L.",
    lastMessageDate: new Date(Date.now() - 28 * 60 * 60000),
    subject: "Atelier de théâtre",
    message: "Chers parents, nous sommes ravis d'annoncer un atelier de théâtre pour les élèves intéressés, qui se tiendra tous les jeudis après l'école à partir du 21 septembre. Cet atelier vise à développer la confiance en soi et les compétences en communication. Les places sont limitées, alors inscrivez votre enfant rapidement !",
  },
  {
    recipientName: "FONTAINE A.",
    lastMessageDate: new Date(Date.now() - 3 * 24 * 60 * 60000),
    subject: "Collecte de fonds pour le voyage scolaire",
    message: "Bonjour à tous, nous lançons une collecte de fonds pour financer le voyage scolaire prévu en juin prochain. Nous organiserons plusieurs événements, dont une vente de gâteaux et une tombola. Votre soutien est essentiel pour offrir cette expérience enrichissante à nos élèves. Merci d'avance pour votre générosité !",
  },
  {
    recipientName: "GIRAUD M.",
    lastMessageDate: new Date(Date.now() - 18 * 24 * 60 * 60000),
    subject: "Wesh les potos",
    message: "On se capte ce week-end pour une session de révision avant les exams ? Faut qu'on gère ça ensemble, on va tout déchirer !",
  }
];

const Chat = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const decodeDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      const minutesDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60));
      if (minutesDiff === 0) {
        return t("Chat_JustNow");
      }
      if (minutesDiff >= 60) {
        return t("Chat_HoursAgo", {count: Math.floor(minutesDiff / 60)}) ;
      }
      return t("Chat_MinutesAgo", {count: minutesDiff});
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return t("Chat_Yesterday");
    }
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    if (date >= weekStart) {
      return date.toLocaleDateString("fr-FR", { weekday: "short" });
    }
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <ScrollView
      style={{ width: "100%", height: "100%" }}
      contentContainerStyle={{ padding: 16 }}
    >
      <List>
        {DemoData.map((chat) => (
          <Item
            onPress={() => router.navigate("/(features)/(chat)/conversation")}
          >
            <Leading>
              <Avatar
                initials={getInitials(chat.recipientName)}
                size={48}
                generateColor
              />
            </Leading>
            <Stack
              direction={"horizontal"}
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography
                variant={"caption"}
                color={"secondary"}
                weight={"semibold"}
              >
                {chat.recipientName}
              </Typography>
              <Typography
                variant={"caption"}
                color={"secondary"}
              >
                {decodeDate(chat.lastMessageDate)}
              </Typography>
            </Stack>
            <Typography
              variant={"title"}
              numberOfLines={1}
            >
              {chat.subject}
            </Typography>
            <Typography
              variant={"caption"}
              color={"secondary"}
              numberOfLines={2}
              style={{ lineHeight: 15 }}
            >
              {chat.message}
            </Typography>
          </Item>
        ))}
      </List>
    </ScrollView>
  );
};

export default Chat;