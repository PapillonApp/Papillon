import Typography from "@/ui/components/Typography";
import List from "@/ui/components/List";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import { ScrollView } from "react-native";
import Stack from "@/ui/components/Stack";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import { router } from "expo-router";
import { useAccountStore } from "@/stores/account";

const SubjectPersonalization = () => {
  const { colors } = useTheme();

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);
  const subjects = Object.entries(account?.customisation?.subjects ?? {}).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  function renderItem(emoji: string, name: string, id: string, color: string) {
    return (<Item>
      <Leading>
        <Stack
          backgroundColor={color + "20"}
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
            {emoji}
          </Typography>
        </Stack>
      </Leading>
      <Typography variant={"title"}>
        {name}
      </Typography>
      <Trailing>
        <AnimatedPressable
          onPress={() => {
            router.push({
              pathname: "/(settings)/edit_subject",
              params: {
                id,
                emoji,
                color,
                name
              }
            })
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
    </Item>)
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior={"always"}
    >
      <List>
        {subjects.map(item => renderItem(item.emoji, item.name, item.id, item.color))}
      </List>
    </ScrollView>
  );
};

export default SubjectPersonalization;