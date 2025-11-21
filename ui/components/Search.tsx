import React, { useEffect, useState } from "react";
import { Platform, TextInput, TouchableOpacity, View } from "react-native";
import Stack from "./Stack";
import { useTheme } from "@react-navigation/native";
import Icon from "./Icon";
import { Papicons } from "@getpapillon/papicons";
import { Dynamic } from "./Dynamic";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";

interface SearchProps {
  placeholder?: string,
  onTextChange?: (text: string) => void,
  color?: string,
};

const Search: React.FC<SearchProps> = ({
  placeholder = "Rechercher",
  onTextChange = () => { },
  color,
}) => {
  const { colors } = useTheme();
  const [input, setInput] = useState("");

  useEffect(() => {
    onTextChange(input);
  }, [input]);

  return (
    <Stack
      height={42}
      // @ts-ignore overground not typed yet (TODO)
      backgroundColor={colors.text + "15"}
      style={{
        marginHorizontal: 16,
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
  );
};

export default Search;