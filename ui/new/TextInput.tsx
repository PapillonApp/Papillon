import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TextInput,View } from 'react-native';

const PapillonTextInput = ({ height = 54, color, ...props }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderColor: colors.text + "20",
        borderWidth: 1,
        borderRadius: 16,
        borderCurve: 'continuous',
        height: height,
        width: '100%',
        ...props.contentContainerStyle,
      }}
    >
      <TextInput
        style={{
          flex: 1,
          paddingHorizontal: 16,
          color: colors.text,
          fontFamily: 'medium',
          fontSize: 17,
        }}
        placeholderTextColor={colors.text + "80"}
        cursorColor={color ?? colors.primary}
        selectionColor={color ?? colors.primary}
        selectionHandleColor={color ?? colors.primary}
        {...props}
      />
    </View>
  );
}

export default PapillonTextInput;