import { Image, Text, View } from "react-native";

import { Account } from "@/stores/account/types";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Pen } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import React from "react";

const AccountContainerCard = ({ account, onPress }: {
  account: Account
  onPress: () => unknown
}) => {
  const theme = useTheme();
  const { colors } = theme;

  return (<>
    <LinearGradient
      pointerEvents="none"
      colors={[colors.primary + "00", colors.primary + "20", colors.primary + "00"]}
      locations={[0, 0.75, 1]}
      style={{
        position: "absolute",
        top: -400,
        left: 0,
        right: 0,
        height: 700,
        zIndex: -200,
      }}
    />

    <PressableScale
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: 10,
            borderRadius: 100,
            zIndex: 100,
            backgroundColor: colors.background,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
        >
          <Pen
            size={18}
            strokeWidth={2.75}
            color={colors.primary}
          />
        </View>

        <View style={{
          width: "100%",
          height: 120,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary + "40",
        }}>
          <Image
            source={require("../../../assets/images/mask_stars_settings.png")}
            tintColor={theme.dark ? colors.primary + "40" : colors.primary + "70"}
            resizeMode="contain"
            style={{ width: "135%" }}
          />
        </View>
        <View
          style={{
            backgroundColor: colors.card,
            padding: 15,
            flexDirection: "row",
          }}
        >
          <Image
            source={!(account.isExternal) && account.personalization.profilePictureB64 ? { uri: account.personalization.profilePictureB64} : defaultProfilePicture(account.service, !(account.isExternal) && account.identityProvider?.name || "")}
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              // @ts-expect-error : no typed property
              borderCurve: "continuous",
              marginRight: 15,
            }}
          />
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              flex: 1,
              gap: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontFamily: "semibold",
                  maxWidth: "85%",
                }}>{!(account.isExternal) ? account.studentName.first : undefined} {!(account.isExternal) ? account.studentName?.last : undefined}</Text>
              {!(account.isExternal) && account.className && <View
                style={{
                  backgroundColor: theme.dark ? colors.primary + "60" : colors.primary + "40",
                  borderRadius: 8,
                  borderCurve: "continuous",
                  paddingVertical: 2,
                  paddingHorizontal: 5,
                  overflow: "hidden",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: 16,
                    fontFamily: "semibold",
                    letterSpacing: 0.5,
                  }}
                >{account.className}</Text>
              </View>}
            </View>
            {!(account.isExternal) && account.schoolName && (
              <Text
                style={{
                  color: colors.text + "70",
                  fontSize: 14,
                  fontFamily: "medium",
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {account.schoolName}
              </Text>
            )}
          </View>
        </View>
      </View>
    </PressableScale>
  </>);
};

export default AccountContainerCard;
