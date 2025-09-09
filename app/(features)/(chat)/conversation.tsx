import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import {
    NativeHeaderPressable,
  NativeHeaderSide,
  NativeHeaderTitle,
} from "@/ui/components/NativeHeader";
import { Papicons } from "@getpapillon/papicons";
import Reanimated from "react-native-reanimated";
import Typography from "@/ui/components/Typography";
import { t } from "i18next";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { Router, useRouter } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import Avatar from "@/ui/components/Avatar";
import Stack from "@/ui/components/Stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import AnimatedPressable from "@/ui/components/AnimatedPressable";

const AnimatedTextInput = Reanimated.createAnimatedComponent(TextInput);

const Conversation = () => {
  const { colors } = useTheme();
  const router: Router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [inputHeight, setInputHeight] = React.useState(22);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, marginTop: insets.top, marginBottom: insets.bottom}}
      behavior={"padding"}
    >
      <ScrollView
        style={{flex: 1}}
        contentInsetAdjustmentBehavior={"always"}
      >
        <Typography>Chat screen</Typography>
        <Typography>Platform: {Platform.OS}</Typography>
      </ScrollView>

      <View
        style={{
          minHeight: 70,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border + "40",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <AnimatedPressable
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.text + "10",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.text + "10",
          }}
          onPress={() => Alert.alert("New message")}
        >
          <Papicons name={"Plus"} color={colors.text + "7F"} size={28}/>
        </AnimatedPressable>
        <Stack
          style={{
            flex: 1,
            minHeight: 50,
            borderRadius: 25,
            backgroundColor: colors.text + "10",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.text + "10",
            flexDirection: "row",
            paddingRight: 10,
          }}
        >
        <AnimatedTextInput
          style={{
            flex: 1,
            fontFamily: "medium",
            paddingLeft: 15,
            paddingRight: 10,
            fontSize: 16,
            lineHeight: 22,
            height: inputHeight
          }}
          placeholder={t("chat.newMessagePlaceholder")}
          multiline={true}
          textAlignVertical={"center"}
          onContentSizeChange={(e) => {
            console.log(e.nativeEvent.contentSize.height);
            setInputHeight(Math.min(e.nativeEvent.contentSize.height, 22 * 5) + 10);
          }}
          enablesReturnKeyAutomatically
        />
          <AnimatedPressable
            style={{
              width: 30,
              height: 30,
              backgroundColor: "#48B7E8",
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.text + "10",
            }}
          >
            <Papicons name={"ArrowUp"} color={"#FFF"} size={20}/>
          </AnimatedPressable>
        </Stack>
      </View>

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => router.back()}>
          <Papicons name={"ChevronLeft"} color={colors.text + "8F"} size={28} />
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <LinearGradient
        colors={[ colors.background, colors.background + "E6", colors.background + "80", colors.background + "00" ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight - insets.top + 20,
        }}
      />
      <NativeHeaderTitle style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => Alert.alert("Profile pressed")}
          style={{flexDirection: "row", gap: 10, alignItems: "center"}}
        >
          <Avatar
            initials={"AB"}
            size={32}
          />
          <Stack>
            <Typography variant={"caption"} color={"secondary"}>M. MARTIN</Typography>
            <Typography variant={"title"} style={{marginTop: -10}}>Documents cours</Typography>
          </Stack>
        </TouchableOpacity>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable>
          <Ellipsis color={colors.text + "8F"} size={28}/>
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </KeyboardAvoidingView>
  )
}

export default Conversation;