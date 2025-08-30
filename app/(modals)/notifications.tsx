import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { Dimensions } from "react-native";

const NotificationsModal = () => {
  const { colors } = useTheme();
  return (
    <Stack
      hAlign={"center"}
      vAlign={"center"}
      padding={20}
      style={{width: "100%", height: Dimensions.get("window").height * 0.6}}
    >
      <Papicons name={"Clock"} size={80} style={{marginBottom: 10}} opacity={0.5} color={colors.text}/>
      <Typography variant="h2" align={"center"}>
        Ça arrive bientôt !
      </Typography>
      <Typography variant={"caption"} align={"center"} color={"secondary"}>
        Nous travaillons dur pour vous offrir cette fonctionnalité dans une future mise à jour.
      </Typography>
    </Stack>
  )
}

export default NotificationsModal;