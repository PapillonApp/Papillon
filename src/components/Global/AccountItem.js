var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Image, Text, View } from "react-native";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { AccountService } from "@/stores/account/types";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { Check } from "lucide-react-native";
import React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
var AccountItem = function (_a) {
    var _b, _c, _d, _e, _f;
    var account = _a.account, additionalStyles = _a.additionalStyles, endCheckMark = _a.endCheckMark;
    var theme = useTheme();
    return (<View style={__assign(__assign({}, (additionalStyles || {})), { flexDirection: "row", padding: 9, borderStyle: "solid", alignItems: "center" })}>
      <View style={{
            width: 30,
            height: 30,
            borderRadius: 80,
            backgroundColor: "#000000",
            marginRight: 10,
        }}>
        <Image source={account.personalization.profilePictureB64 ?
            { uri: account.personalization.profilePictureB64 } :
            defaultProfilePicture(account.service, ((_b = account.identityProvider) === null || _b === void 0 ? void 0 : _b.name) || "")} style={{
            width: "100%",
            height: "100%",
            borderRadius: 80,
        }} resizeMode="cover"/>
      </View>
      <View style={{
            flexDirection: "column",
            gap: 2,
        }}>
        <View style={{
            flexDirection: "row",
            flexWrap: "nowrap",
            minWidth: "90%",
            maxWidth: "75%"
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
            flexShrink: 1
        }} numberOfLines={1} ellipsizeMode="tail">
            {((_c = account.studentName) === null || _c === void 0 ? void 0 : _c.first) || "Utilisateur"}{" "}
            {((_d = account.studentName) === null || _d === void 0 ? void 0 : _d.last) || ""}
          </Text>
        </View>

        <Text style={{
            fontSize: 15,
            fontWeight: 500,
            color: theme.colors.text + "50",
            fontFamily: "medium",
            maxWidth: "70%",
        }} numberOfLines={1} ellipsizeMode="tail">
          {AccountService[account.service] !== "Local" ?
            AccountService[account.service] :
            (_f = (_e = account.identityProvider) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : "Compte local"}
        </Text>
      </View>
      {endCheckMark &&
            <Reanimated.View style={{
                    position: "absolute",
                    right: 15,
                }} entering={animPapillon(ZoomIn)} exiting={FadeOut.duration(200)}>
        <Check size={22} strokeWidth={3.0} color={theme.colors.primary}/>
      </Reanimated.View>}
    </View>);
};
export default AccountItem;
