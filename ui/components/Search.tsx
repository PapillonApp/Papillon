import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, TextInput, TouchableOpacity, View } from "react-native";

import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { Dynamic } from "./Dynamic";
import Icon from "./Icon";
import Stack from "./Stack";

interface SearchProps {
  autoFocus?: boolean,
  placeholder?: string,
  onTextChange?: (text: string) => void,
  color?: string,
  style?: StyleProp<ViewStyle>,
  value?: string,
  setValue?: (text: string) => void,
  icon?: string,
};

const SearchContainer = ({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) => {
  const { colors } = useTheme();

  if (!isLiquidGlassSupported) {
    return (
      <View
        style={[{
          width: Dimensions.get("window").width - 32,
          borderRadius: 300,
          backgroundColor: Platform.OS === 'ios' ? colors.text + "16" : colors.item,
        }, style]}
      >
        {children}
      </View>
    );
  }

  return (
    <LiquidGlassView
      glassType="regular"
      isInteractive={true}
      glassTintColor="transparent"
      glassOpacity={0}
      style={[{
        width: Dimensions.get("window").width - 32,
        borderRadius: 300,
      }, style]}
    >
      {children}
    </LiquidGlassView>
  );
};

const Search: React.FC<SearchProps> = ({
  placeholder = "Rechercher",
  onTextChange = () => { },
  autoFocus = false,
  color,
  style,
  value,
  setValue,
  icon,
}) => {
  const { colors } = useTheme();
  const [localInput, setLocalInput] = useState("");

  const input = value !== undefined && setValue !== undefined ? value : localInput;
  const setInput = (text: string) => {
    if (setValue) {
      setValue(text);
    } else {
      setLocalInput(text);
    }
  };

  useEffect(() => {
    onTextChange(input);
  }, [input]);

  return (
    <SearchContainer style={style}>
      <Stack
        height={42}
        style={{
          borderWidth: 0,
          overflow: 'hidden',
        }}
        radius={300}
        direction="horizontal"
        hAlign="center"
        vAlign="center"
        gap={10}
        padding={[14, 0]}
      >
        <Icon size={24} opacity={input.length > 0 ? 1 : 0.5}>
          <Papicons name={icon ?? "search"} />
        </Icon>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          cursorColor={color}
          selectionColor={color}
          selectionHandleColor={color}
          placeholderTextColor={colors.text + "77"}
          style={{
            flex: 1,
            height: '100%',
            fontSize: 17,
            color: colors.text,
            fontFamily: "semibold",
            marginTop: Platform.OS === 'android' ? 2 : 0,
          }}
        />

        {input.length > 0 && (
          <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut}>
            <TouchableOpacity
              onPress={() => setInput("")}
            >
              <Icon size={20} opacity={0.5}>
                <Papicons name="cross" />
              </Icon>
            </TouchableOpacity>
          </Dynamic>
        )}
      </Stack>
    </SearchContainer>
  );
};

export default Search;
