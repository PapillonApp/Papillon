import { NativeText } from "@/components/Global/NativeComponents";
import React from "react";
import { View } from "react-native";

type SubjectTitleParameters = {
  subjectData: {
    color: string
    pretty: string
    emoji: string
  }
};

const SubjectTitle = ({ subjectData }: SubjectTitleParameters) => {

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: subjectData.color + "11",
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <NativeText
          style={{
            fontSize: 18,
            lineHeight: 24,
          }}
        >
          {subjectData.emoji}
        </NativeText>
        <NativeText
          style={{
            flex: 1,
          }}
          numberOfLines={1}
          variant="overtitle"
        >
          {subjectData.pretty}
        </NativeText>
      </View>
    </View>
  );
};

export default SubjectTitle;
