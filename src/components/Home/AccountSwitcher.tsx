import React, { memo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ChevronDown } from "lucide-react-native";
import Reanimated, {
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { useCurrentAccount } from "@/stores/account";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import PapillonSpinner from "../Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { BlurView } from "expo-blur";

const ReanimatedBlurView = Reanimated.createAnimatedComponent(BlurView);
const AnimatedChevronDown = Reanimated.createAnimatedComponent(ChevronDown);

const AccountSwitcher = ({
  small = false,
  opened = false,
  modalOpen = false,
  translationY,
  loading = false,
}: {
  small?: boolean;
  opened?: boolean;
  modalOpen?: boolean;
  translationY?: Reanimated.SharedValue<number>;
  loading?: boolean;
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const account = useCurrentAccount((store) => store.account!);

  const shouldHideName = account.personalization.hideNameOnHomeScreen || false;
  const shouldHidePicture = account.personalization.hideProfilePicOnHomeScreen || false;

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: 1,
    borderRadius: 80,
    borderColor: interpolateColor(
      translationY?.value || 0,
      [200, 251],
      ["#ffffff50", colors.border]
    ),
    backgroundColor: interpolateColor(
      translationY?.value || 0,
      [200, 251],
      ["#ffffff30", "transparent"]
    ),
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: colors.text,
    fontSize: 16,
    fontFamily: "semibold",
    maxWidth: 140,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      translationY?.value || 0,
      [200, 251],
      ["#FFF", colors.text]
    ),
    marginLeft: -6,
  }));

  const renderProfilePicture = () => {
    if (shouldHidePicture) {
      return <View style={{ marginLeft: -8, height: small ? 30 : 28 }} />;
    }
    return (
      <Image
        source={
          account.personalization.profilePictureB64 &&
          account.personalization.profilePictureB64.trim() !== ""
            ? { uri: account.personalization.profilePictureB64 }
            : defaultProfilePicture(account.service, account.identityProvider?.name || "")
        }
        style={[
          styles.avatar,
          {
            backgroundColor: colors.text + "22",
            height: small ? 30 : 28,
            width: small ? 30 : 28,
            borderColor: modalOpen ? colors.text + "20" : "#FFFFFF32",
          },
        ]}
      />
    );
  };

  return (
    <Reanimated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.dark ? colors.background : colors.card,
          borderColor: modalOpen ? colors.border : "transparent",
          shadowOpacity: modalOpen ? 0.16 : 0,
        },
      ]}
      layout={animPapillon(LinearTransition)}
    >
      <Reanimated.View style={styles.innerContainer} layout={animPapillon(LinearTransition)}>
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={[
            styles.accountSwitcher,
            loading && { shadowOpacity: 0 },
            small && styles.smallAccountSwitcher,
          ]}
        >
          <Reanimated.View style={styles.row} layout={animPapillon(LinearTransition)}>
            {renderProfilePicture()}
            <Reanimated.Text
              style={textAnimatedStyle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {account.studentName
                ? account.studentName.first + (shouldHideName ? "" : " " + account.studentName.last)
                : "Mon compte"}
            </Reanimated.Text>
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
            <Reanimated.View layout={animPapillon(LinearTransition)}>
              <AnimatedChevronDown
                size={24}
                strokeWidth={2.3}
                style={iconAnimatedStyle}
                color={colors.text}
              />
            </Reanimated.View>
          </Reanimated.View>
        </Reanimated.View>
      </Reanimated.View>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "visible",
    alignSelf: "flex-start",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  innerContainer: {
    paddingHorizontal: 2,
    paddingVertical: 0,
    alignSelf: "flex-start",
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
  },
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
  smallAccountSwitcher: {
    paddingHorizontal: 0,
    elevation: 0,
    borderRadius: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: "#00000010",
    borderColor: "#00000020",
    borderWidth: 1,
  },
});

export default memo(AccountSwitcher);
