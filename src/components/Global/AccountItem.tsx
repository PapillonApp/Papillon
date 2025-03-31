import {Image, StyleProp, Text, View, ViewStyle} from "react-native";
import { animPapillon } from "@/utils/ui/animations";

import Reanimated, {
  FadeOut,
  ZoomIn
} from "react-native-reanimated";
import {PrimaryAccount, AccountService} from "@/stores/account/types";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";
import {Check} from "lucide-react-native";
import React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

const AccountItem: React.FC<{
  account: PrimaryAccount,
  additionalStyles?: StyleProp<ViewStyle>,
  endCheckMark: boolean
}> = ({
  account,
  additionalStyles,
  endCheckMark
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        ...(additionalStyles || {} as any),
        flexDirection: "row",
        padding: 9,
        borderStyle: "solid",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 80,
          backgroundColor: "#000000",
          marginRight: 10,
        }}
      >
        <Image
          source={
            account.personalization.profilePictureB64 ?
              { uri: account.personalization.profilePictureB64 } :
              defaultProfilePicture(account.service, account.identityProvider?.name || "")}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 80,
          }}
          resizeMode="cover"
        />
      </View>
      <View
        style={{
          flexDirection: "column",
          gap: 2,
        }}
      >
        <View style={{
          flexDirection: "row",
          flexWrap: "nowrap",
          minWidth: "90%",
          maxWidth: "75%"
        }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "semibold",
              color: theme.colors.text,
              flexShrink: 1
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {account.studentName?.first || "Utilisateur"}{" "}
            {account.studentName?.last || ""}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: theme.colors.text + "50",
            fontFamily: "medium",
            maxWidth: "70%",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {AccountService[account.service] !== "Local" ?
            AccountService[account.service] :
            account.identityProvider?.name ?? "Compte local"
          }
        </Text>
      </View>
      {endCheckMark &&
      <Reanimated.View
        style={{
          position: "absolute",
          right: 15,
        }}
        entering={animPapillon(ZoomIn)}
        exiting={FadeOut.duration(200)}
      >
        <Check
          size={22}
          strokeWidth={3.0}
          color={theme.colors.primary}
        />
      </Reanimated.View>
      }
    </View>
  );
};

export default AccountItem;
