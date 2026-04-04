import { View } from "react-native";
import { Papicons } from "@getpapillon/papicons";
import Typography from "@/ui/new/Typography";

export enum SkillChipLevel {
  Insufficient,
  Beginner,
  Weak,
  AlmostProficient,
  Satisfactory,
  Excellent,
  Absent,
  Exempt,
  NotSubmitted,
  NotGraded,
}

export interface SkillChipProps {
  level: SkillChipLevel;
}

export function SkillChip({ level }: SkillChipProps) {

  const skillInfo: Array<{
    color: string;
    text?: string;
    icon?: string;
    foregroundColor?: string;
    fontSize?: number;
    translateX?: number;
  }> = [
    { color: "#DA2400" },
    { color: "#DD6B00" },
    { color: "#E8B048" },
    { color: "#12BB67" },
    { color: "#007FDA" },
    { color: "#007FDA", text: "+" },
    {
      color: "#E1E6F8",
      text: "a",
      foregroundColor: "#3A56D0",
      fontSize: 15,
      translateX: 1,
    },
    {
      color: "#FAE9D9",
      text: "d",
      foregroundColor: "#DD6B00",
      fontSize: 14,
      translateX: -1,
    },
    { color: "#FAD9E0", icon: "Cross", foregroundColor: "#DA2400" },
    { color: "#D9D9D9", icon: "Cross", foregroundColor: "#6F6F6F" },
  ];

  return (
    <View
      style={{
        width: 21,
        height: 21,
        backgroundColor: "#FFF",
        shadowColor: "#00000038",
        shadowOffset: { width: -1, height: 0 },
        shadowRadius: 2,
        elevation: 2,
        borderRadius: 20,
        padding: 2.5,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: skillInfo[level].color,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {skillInfo[level].icon && (
          <Papicons
            name={skillInfo[level].icon}
            color={skillInfo[level].foregroundColor}
            size={12}
          />
        )}
        {skillInfo[level].text && (
          <Typography
            style={{
              fontSize: skillInfo[level].fontSize ?? 17,
              lineHeight: (skillInfo[level].fontSize ?? 17),
              marginTop: -(skillInfo[level].translateX ?? 0),
            }}
            color={skillInfo[level].foregroundColor ?? "#FFF"}
          >
            {skillInfo[level].text}
          </Typography>
        )}
      </View>
    </View>
  );
}