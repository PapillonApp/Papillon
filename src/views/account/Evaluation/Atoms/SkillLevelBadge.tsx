import {SkillLevel} from "@/services/shared/Evaluation";
import {View} from "react-native";
import React, {useState} from "react";
import {NativeText} from "@/components/Global/NativeComponents";
import {Plus} from "lucide-react-native";


interface SkillLevelBadgeProps {
  skillLevel: SkillLevel;
}

export const SkillLevelBadge: React.FC<SkillLevelBadgeProps> = ({ skillLevel }) => {
  const [color, setColor] = useState("#ECECEC");

  React.useEffect(() => {
    switch (skillLevel) {
      case 1:
        setColor("#F53A22");
        break;
      case 2:
        setColor("#FF9F46");
        break;
      case 3:
        setColor("#FFDD1F");
        break;
      case 4:
        setColor("#97E800");
        break;
      case 5:
        setColor("#08AD00");
        break;
      case 6:
        setColor("#00BA9E");
        break;
      default:
        setColor("#ECECEC");
        break;
    }
  }, []);

  return (
    <View
      style={{
        height: 20,
        width: 20,
        borderRadius: 100,
        backgroundColor: color,
        borderColor: "#00000026",
        borderWidth: 1.5,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {skillLevel === SkillLevel.NotReturned && (
        <View
          style={{
            height: 20,
            width: 2,
            backgroundColor: "#BDBDBD",
            transform: [{ rotate: "-45deg" }],
          }}
        />
      )}
      {skillLevel === SkillLevel.Dispensed && (
        <NativeText style={{
          color: "#006AB7",
          fontSize: 15,
          fontFamily: "semibold",
          transform: [{ translateY: -1 }],
        }}>
          d
        </NativeText>
      )}
      {skillLevel === SkillLevel.Absent && (
        <NativeText style={{
          color: "#006AB7",
          fontSize: 15,
          fontFamily: "semibold",
          transform: [{ translateY: -2 }, {translateX: 0.5}],
        }}>
          a
        </NativeText>
      )}
      {skillLevel === SkillLevel.Excellent && (
        <Plus size={15} color={"#fff"} strokeWidth={3} />
      )}
    </View>
  );
};

