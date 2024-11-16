import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ChevronDown } from "lucide-react-native";

import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

import { useCurrentAccount } from "@/stores/account";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import PapillonSpinner from "../Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";

const AccountSwitcher: React.FC<{
  small?: boolean,
  scrolled?: boolean,
  translationY?: Reanimated.SharedValue<number>,
  loading?: boolean,
}> = ({ small, scrolled, translationY, loading }) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(store => store.account!);

  const shouldHideName = account.personalization.hideNameOnHomeScreen || false;
  const shouldHidePicture = account.personalization.hideProfilePicOnHomeScreen || false;

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
      style={[
        styles.accountSwitcher,
        {
          backgroundColor: colors.background,
        },
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

      {!small && (
        <Reanimated.View
          style={[{
            position: "absolute",
            backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 10,
          }]}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
        />
      )}

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
            source={(account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== "") ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service)}
            style={[
              styles.avatar,
              {
                backgroundColor: colors.text + "22",
                height: small ? 30 : 28,
                width: small ? 30 : 28,
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

        <Text
          style={[styles.accountSwitcherText, {
            color: colors.text,
          }]}

          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {account.studentName ? (
            account.studentName?.first + (shouldHideName ? "" : " " + account.studentName.last)
          ) : "Mon compte"}
        </Text>

        {loading && (
          <PapillonSpinner
            size={20}
            strokeWidth={3}
            color={colors.text}
            animated
            entering={animPapillon(ZoomIn)}
            exiting={animPapillon(ZoomOut)}
          />
        )}

        <Reanimated.View
          layout={animPapillon(LinearTransition)}
        >
          <ChevronDown
            size={24}
            strokeWidth={2.3}
            color={colors.text + "55"}
            style={{ marginLeft: -6 }}
          />
        </Reanimated.View>
      </Reanimated.View>

    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  accountSwitcher: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 12,
    borderRadius: 10,
    borderCurve: "continuous",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  avatar: {
    height: 28,
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: "#00000010",
  },

  accountSwitcherText: {
    fontSize: 16,
    fontFamily: "semibold",
    maxWidth: 140,
  },
});

export default AccountSwitcher;
