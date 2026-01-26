import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmojiPicker, { fr } from 'rn-emoji-keyboard';

import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useAccountStore } from "@/stores/account";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { CompactGrade } from "@/ui/components/CompactGrade";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Colors } from "@/utils/subjects/colors";

export default function EditSubject() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const [selectedName, setSelectedName] = useState<string>(String(params.name));
  const [selectedColor, setSelectedColor] = useState<string>(Colors.find(c => c === String(params.color)) || Colors[0]);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(String(params.emoji));
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const AvailableEmojis = [
    "📖",
    "🧮",
    "🌍",
    "🎨",
    "⚽",
    "🎵",
    "🧪",
    "custom",
  ];


  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? insets.top : 0,
      }}
    >
      <Stack
        padding={15}
        style={{ justifyContent: "space-between", alignItems: "center" }}
        direction={"horizontal"}
      >
        <AnimatedPressable
          style={{
            padding: 10,
            backgroundColor: colors.text + "10",
            borderRadius: 100,
          }}
          onPress={() => {
            router.back();
          }}
        >
          <Papicons name={"Cross"}
            size={25}
            color={colors.text + "7F"}
          />
        </AnimatedPressable>
        <Typography variant={"title"}>Modifier la matière</Typography>
        <AnimatedPressable
          style={{
            padding: 10,
            backgroundColor: colors.primary,
            borderRadius: 100,
          }}
          onPress={() => {
            const store = useAccountStore.getState()

            store.setSubjectName(String(params.id), selectedName)
            store.setSubjectEmoji(String(params.id), selectedEmoji)
            store.setSubjectColor(String(params.id), selectedColor)

            router.back();
          }}
        >
          <Papicons name={"Check"}
            size={25}
            color={"#FFF"}
          />
        </AnimatedPressable>
      </Stack>
      <Stack
        hAlign={"center"}
        pointerEvents={"none"}
      >
        <CompactGrade
          date={new Date()}
          score={12.60}
          outOf={20}
          description={"Exemple d’une note avec la matière"}
          emoji={selectedEmoji}
          title={selectedName}
          color={selectedColor}
        />
      </Stack>

      <Stack
        gap={10}
      >
        <Stack gap={5}
          direction={"horizontal"}
          hAlign={"center"}
          style={{ paddingHorizontal: 16, marginTop: 20 }}
        >
          <Papicons name={"Font"}
            color={colors.text + "7F"}
            size={18}
          />
          <Typography color="secondary">Nom de la matière</Typography>
        </Stack>
        <Stack style={{ paddingHorizontal: 16 }}>
          <OnboardingInput
            placeholder={"Nom de la matière"}
            text={selectedName}
            setText={setSelectedName}
            icon={"Font"}
            inputProps={{}}
          />
        </Stack>
        <Stack gap={5}
          direction={"horizontal"}
          hAlign={"center"}
          style={{ paddingHorizontal: 16 }}
        >
          <Papicons name={"Palette"}
            color={colors.text + "7F"}
            size={18}
          />
          <Typography color="secondary">Couleur</Typography>
        </Stack>
        <ScrollView
          horizontal
          contentContainerStyle={{ gap: 10, height: 50, alignItems: "center", paddingHorizontal: 16 }}
          showsHorizontalScrollIndicator={false}
        >
          {Colors.map((color) => (
            <AnimatedPressable
              key={color}
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                backgroundColor: color,
                borderWidth: 4,
                borderColor: "#FFF",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.25,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Papicons name={"Check"}
                  color={"#FFF"}
                />
              )}
            </AnimatedPressable>
          ))}
        </ScrollView>
        <Stack gap={5}
          direction={"horizontal"}
          hAlign={"center"}
          style={{ paddingHorizontal: 16 }}
        >
          <Papicons name={"Emoji"}
            color={colors.text + "7F"}
            size={18}
          />
          <Typography color="secondary">Emoji</Typography>
        </Stack>
        <ScrollView
          horizontal
          style={{ width: Dimensions.get("window").width }}
          contentContainerStyle={{ gap: 10, height: 60, alignItems: "center", paddingHorizontal: 16 }}
          showsHorizontalScrollIndicator={false}
        >
          {!AvailableEmojis.includes(selectedEmoji) && (
            <AnimatedPressable
              style={{
                width: 60,
                height: 60,
                borderRadius: 100,
                backgroundColor: selectedColor + "20",
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                style={{
                  fontSize: 25,
                  lineHeight: 32,
                }}
              >
                {selectedEmoji}
              </Typography>
            </AnimatedPressable>
          )}
          {AvailableEmojis.map((emoji) => (
            <AnimatedPressable
              key={emoji}
              style={{
                width: 60,
                height: 60,
                borderRadius: 100,
                backgroundColor: selectedColor + (selectedEmoji === emoji ? "20" : "00"),
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                if (emoji === "custom") {
                  setIsEmojiPickerOpen(true);
                }
                else {
                  setSelectedEmoji(emoji)
                }
              }}
            >
              {emoji === "custom" ? (
                <Papicons name={"Emoji"} color={colors.text + "7F"} size={25} />
              ) : (
                <Typography
                  style={{
                    fontSize: 25,
                    lineHeight: 32,
                  }}
                >
                  {emoji}
                </Typography>
              )}
            </AnimatedPressable>
          ))}
        </ScrollView>
      </Stack>

      <EmojiPicker
        onEmojiSelected={(emojiObject) => {
          setSelectedEmoji(emojiObject.emoji);
          setIsEmojiPickerOpen(false);
        }}
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        translation={fr}
        categoryPosition="bottom"
        emojiSize={48}
        expandable={false}
        defaultHeight="80%"
        styles={{
          header: {
            fontFamily: "bold",
          },
        }}
        theme={{
          backdrop: '#00000055',
          knob: "transparent",
          container: colors.background,
          header: colors.text,
          skinTonesContainer: colors.card,
          category: {
            icon: colors.text,
            iconActive: colors.primary,
            container: colors.background,
            containerActive: colors.primary + "20",
          },
        }}
      />
    </View>
  );
};