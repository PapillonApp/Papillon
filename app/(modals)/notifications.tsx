import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

const NotificationsModal = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      hAlign={"center"}
      vAlign={"center"}
      padding={20}
      style={{ width: "100%", height: Dimensions.get("window").height * 0.45 }}
    >
      <Papicons name={"Clock"} size={80} style={{ marginBottom: 10 }} opacity={0.5} color={colors.text} />
      <Typography variant="h2" align={"center"}>
        {t("Feature_Soon")}
      </Typography>
      <Typography variant={"caption"} align={"center"} color={"secondary"}>
        {t("Feature_Soon_Notification")}
      </Typography>
    </Stack>
  )
}

export default NotificationsModal;