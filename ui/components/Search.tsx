import React, { useEffect, useState } from "react";
import { Dimensions, Platform, TextInput, TouchableOpacity, View } from "react-native";
import Stack from "./Stack";
import { useTheme } from "@react-navigation/native";
import Icon from "./Icon";
import { Papicons } from "@getpapillon/papicons";
import { Dynamic } from "./Dynamic";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { isLiquidGlassSupported } from "@callstack/liquid-glass";

interface SearchProps {
  placeholder?: string,
  onTextChange?: (text: string) => void,
  color?: string,
  style?: StyleProp<ViewStyle>,
};

const SearchContainer = ({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) => {
  const { colors } = useTheme();

  if (!isLiquidGlassSupported) {
    return (
      <View
        style={[{
          width: Dimensions.get("window").width - 32,
          borderRadius: 300,
          backgroundColor: colors.text + "16",
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
  color,
  style,
}) => {
  const { colors } = useTheme();
  const [input, setInput] = useState("");

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
          <Papicons name="search" />
        </Icon>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
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