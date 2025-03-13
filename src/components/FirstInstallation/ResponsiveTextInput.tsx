import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@react-navigation/native";
import useScreenDimensions from "@/hooks/useScreenDimensions";

const ResponsiveTextInput = React.forwardRef<TextInput, TextInputProps>(
  (
    {
      defaultValue,
      value,
      onChangeText,
      placeholder,
      secureTextEntry = false,
      autoCapitalize = "none",
      keyboardType = "default",
      style,
    },
    ref
  ) => {
    const theme = useTheme();
    const { colors } = theme;
    const { isTablet } = useScreenDimensions();

    return (
      <TextInput
        style={[
          style,
          {
            borderColor: colors.border,
            color: colors.text,
            maxWidth: isTablet ? "50%" : "100%",
          },
        ]}
        defaultValue={defaultValue}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "88"}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        ref={ref}
      />
    );
  }
);

export default React.memo(ResponsiveTextInput);
