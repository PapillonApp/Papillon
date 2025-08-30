import Stack from "@/ui/components/Stack";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { KeyboardTypeOptions, TextInput, TextInputProps } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";

const OnboardingInput = ({placeholder, text, setText, isPassword, icon, inputProps}: {
  placeholder: string
  text: string
  setText: (text: string) => void
  icon: string
  isPassword?: boolean
  keyboardType?: KeyboardTypeOptions
  inputProps: TextInputProps
}) => {
  const { colors } = useTheme();

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
          backgroundColor: colors.text + "15",
          borderRadius: 300,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        <Icon
          papicon
          size={24}
          fill={colors.text + "7F"}
        >
          <Papicons name={icon} />
        </Icon>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#5B5B5B"
          onChangeText={setText}
          value={text}
          style={{
            color: colors.text + "7F",
            fontSize: 18,
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