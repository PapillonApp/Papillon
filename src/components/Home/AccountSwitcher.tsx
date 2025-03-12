import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ChevronDown } from "lucide-react-native";

import Reanimated, {
  interpolateColor,
  LinearTransition, useAnimatedStyle,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

import { useCurrentAccount } from "@/stores/account";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import PapillonSpinner from "../Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";

const ReanimatedBlurView = Reanimated.createAnimatedComponent(BlurView);

const AccountSwitcher: React.FC<{
  small?: boolean,
  opened?: boolean,
  modalOpen?: boolean,
  translationY?: Reanimated.SharedValue<number>,
  loading?: boolean,
}> = ({ small, opened, modalOpen, translationY, loading }) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(store => store.account!);

  const shouldHideName = account.personalization.hideNameOnHomeScreen || false;
  const shouldHidePicture = account.personalization.hideProfilePicOnHomeScreen || false;

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: 1,
    borderRadius: 80,
    borderColor: interpolateColor(
      translationY?.value || 0, // Should think to pass a default value
      [200, 251],
      ["#ffffff50", colors.border],
    ),
    backgroundColor: interpolateColor(
      translationY?.value || 0, // Should think to pass a default value
      [200, 251],
      ["#ffffff30", "transparent"],
    ),
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      translationY?.value || 0, // Should think to pass a default value
      [200, 251],
      ["#FFF", colors.text],
    ),
    fontSize: 16,
    fontFamily: "semibold",
    maxWidth: 140,
  }));


  const AnimatedChevronDown = Animated.createAnimatedComponent(ChevronDown);
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      translationY?.value || 0, // Should think to pass a default value
      [200, 251],
      ["#FFF", colors.text],
    ),
    marginLeft: -6,
  }));

  return (
    <Reanimated.View
      style={{
        backgroundColor:
          opened ?
            theme.dark && !modalOpen ? "#00000044" : "#FFFFFF22"
            : modalOpen ? colors.text + "10" : "#FFFFFF12",
        borderRadius: 12,
        borderCurve: "continuous",
        overflow: "hidden",
        alignSelf: "flex-start",
      }}
      layout={animPapillon(LinearTransition)}
    >
      <ReanimatedBlurView
        tint={theme.dark ? "dark" : "light"}
        style={{
          paddingHorizontal: 2,
          paddingVertical: 0,
          alignSelf: "flex-start",
        }}
        layout={animPapillon(LinearTransition)}
      >
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={[
            styles.accountSwitcher,
            loading && {
              shadowOpacity: 0,
            },
            small && {
              paddingHorizontal: 0,
              shadowOpacity: 0,
              elevation: 0,
              borderRadius: 0,
              paddingVertical: 0,
              backgroundColor: "transparent",
            }
          ]}
        >
          <Reanimated.View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              },
            ]}
            layout={animPapillon(LinearTransition)}
          >
            {!shouldHidePicture ? (
              <Image
                source={(account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== "") ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service, account.identityProvider?.name || "")}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: colors.text + "22",
                    height: small ? 30 : 28,
                    width: small ? 30 : 28,
                    borderColor: modalOpen ? colors.text + "20" : "#FFFFFF32",
                  }
                ]}
              />
            ) : (
              <View style={[
                {
                  marginLeft: -8,
                  height: small ? 30 : 28,
                }
              ]} />
            )}

            <Reanimated.Text
              style={{
                color: modalOpen && !opened ? colors.text : "#FFF",
                fontSize: 16,
                fontFamily: "semibold",
                maxWidth: 140,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {account.studentName ? (
                account.studentName?.first + (shouldHideName ? "" : " " + account.studentName.last)
              ) : "Mon compte"}
            </Reanimated.Text>

            {loading && (
              <PapillonSpinner
                size={20}
                strokeWidth={3}
                color={modalOpen && !opened ? colors.text : "#FFF"}
                animated
                entering={animPapillon(ZoomIn)}
                exiting={animPapillon(ZoomOut)}
              />
            )}

            <Reanimated.View
              layout={animPapillon(LinearTransition)}
            >
              <AnimatedChevronDown
                size={24}
                strokeWidth={2.3}
                color={modalOpen && !opened ? colors.text : "#FFF"}
                style={{
                  marginLeft: -6,
                }}
              />
            </Reanimated.View>
          </Reanimated.View>
        </Reanimated.View>
      </ReanimatedBlurView>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  accountSwitcher: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    height: 40,
    borderRadius: 800,
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingVertical: 6,
    gap: 6,
  },

  avatar: {
    height: 28,
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: "#00000010",
    borderColor: "#00000020",
    borderWidth: 1,
  },

  accountSwitcherText: {

  },
});

export default AccountSwitcher;
