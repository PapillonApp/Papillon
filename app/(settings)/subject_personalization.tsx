import Typography from "@/ui/components/Typography";
import List from "@/ui/components/List";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import { ScrollView } from "react-native";
import Stack from "@/ui/components/Stack";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import { router } from "expo-router";

const SubjectPersonalization = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior={"always"}
    >
      <List>
        <Item>
          <Leading>
            <Stack
              backgroundColor={"#009EC5" + "20"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                style={{
                  fontSize: 25,
                  lineHeight: 32,
                }}
              >
                📖
              </Typography>
            </Stack>
          </Leading>
          <Typography variant={"title"}>
            Français
          </Typography>
          <Trailing>
            <AnimatedPressable
              onPress={() => {
                router.push("/(settings)/edit_subject")
              }}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 8,
                paddingRight: 10,
                height: 35,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Papicons name={"PenAlt"} color={colors.text + "7F"} />
              <Typography
                color={"secondary"}
              >
                Modifier
              </Typography>
            </AnimatedPressable>
          </Trailing>
        </Item>
      </List>
    </ScrollView>
  );
};

export default SubjectPersonalization;