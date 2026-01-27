import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { KeyboardTypeOptions, Platform, TextInput, TextInputProps } from "react-native";

import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";

const OnboardingInput = ({ placeholder, text, setText, isPassword, icon, inputProps }: {
  placeholder: string
  text: string
  setText: (text: string) => void
  icon: string
  isPassword?: boolean
  keyboardType?: KeyboardTypeOptions
  inputProps: TextInputProps
}) => {
  const { colors, dark } = useTheme();

  return (
    <Stack flex direction="horizontal" hAlign="center" vAlign="center">
      <Stack
        flex
        direction="horizontal"
        vAlign="center"
        hAlign="center"
        gap={10}
        style={{
          flex: 1,
          padding: 20,
          paddingVertical: Platform.OS === "ios" ? 20 : 10,
          backgroundColor: colors.text + (dark ? "15" : "08"),
          borderRadius: 300,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        <Icon
          papicon
          size={24}
          fill={colors.text + "AF"}
        >
          <Papicons name={icon} />
        </Icon>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.text + "7F"}
          onChangeText={setText}
          value={text}
          style={{
            color: colors.text + "AF",
            fontFamily: "semibold",
            fontSize: 19,
            fontWeight: "600",
            flex: 1,
          }}
          secureTextEntry={isPassword ?? false}
          keyboardType={"default"}
          {...inputProps}
        />
      </Stack>
    </Stack>
  )
}

export default OnboardingInput;