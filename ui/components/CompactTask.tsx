import { useTheme } from "@react-navigation/native";
import Stack from "./Stack";
import Icon from "./Icon";
import { Sparkle } from "lucide-react-native";
import Typography from "./Typography";
import AnimatedPressable from "./AnimatedPressable";
import { View } from "react-native";
import { Papicons } from "@getpapillon/papicons";
import { formatHTML } from "@/utils/format/html";

function CompactTask({ fromCache, setHomeworkAsDone, ref, subject, color, description, emoji, dueDate, done, magic }: { fromCache: boolean, setHomeworkAsDone: (ref: Homework) => void, ref: Homework, subject: string, color: string, description: string, emoji: string, dueDate: Date, done: boolean, magic?: string }) {
  const { colors } = useTheme();

  return (
    <Stack
      style={{
        backgroundColor: color + 50,
        borderRadius: 20,
        width: "100%",
        flex: 1,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      {magic && (
        <Stack gap={10} direction="horizontal" hAlign="center" style={{ paddingHorizontal: 16, paddingTop: 6 }}>
          <Icon size={14} skeleton={false}>
            <Sparkle fill={color} stroke={color} strokeWidth={2} />
          </Icon>
          <Typography color={color} weight='semibold' skeleton={false} skeletonWidth={200}>
            {magic}
          </Typography>
        </Stack>
      )}

      <Stack
        direction="horizontal"
        vAlign="center"
        hAlign="center"
        gap={16}
        padding={[16, 12]}
        style={{ backgroundColor: colors.card, borderTopRightRadius: magic ? 7.5 : undefined, borderTopLeftRadius: magic ? 7.5 : undefined }}
      >
        <Stack
          style={{
            backgroundColor: color + "70",
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 80,
          }}
        >
          <Typography>{emoji}</Typography>
        </Stack>

        <Stack style={{ flex: 1 }} gap={2}>
          <Typography variant="body2">{subject}</Typography>
          <Typography variant="body2" color={colors.text + "95"} numberOfLines={2}>{formatHTML(description)}</Typography>
          <Typography variant="caption" color="secondary">
            {dueDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
          </Typography>
        </Stack>

        <AnimatedPressable
          scaleTo={0.8}
          style={{
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: done ? color : colors.border,
            borderRadius: 80,
            padding: 1.3,
            justifyContent: "center",
            alignItems: "center"
          }}
          disabled={fromCache}
          onPress={() => {
            setHomeworkAsDone(ref)
          }}
        >
          {done && (
            <View
              style={{
                backgroundColor: color,
                width: 24,
                height: 24,
                borderRadius: 80,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Papicons size={13} name="Check" fill={"white"} />
            </View>
          )}
        </AnimatedPressable>
      </Stack>
    </Stack>
  )
}

export default CompactTask;