import React from "react";
import { Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { Info } from "lucide-react-native";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
var IdentityProviderSelector = function (_a) {
    var navigation = _a.navigation;
    var universityProviders = [
        {
            name: "univ_lorraine",
            title: "Université de Lorraine",
            description: "Utilise ton compte Sésame pour te connecter",
            image: require("@/../assets/images/service_ulorraine.png"),
            instanceURL: "https://mobile-back.univ-lorraine.fr",
            navigate: function (instanceURL, title, image) { return navigation.navigate("Multi_Login", { instanceURL: instanceURL, title: title, image: image }); },
        },
        {
            name: "univ_unimes",
            title: "Université de Nîmes",
            description: "Utilise ton compte Sésame pour te connecter",
            image: require("@/../assets/images/service_unimes.png"),
            instanceURL: "https://mobile-back.unimes.fr",
            navigate: function (instanceURL, title, image) { return navigation.navigate("Multi_Login", { instanceURL: instanceURL, title: title, image: image }); },
        },
        {
            name: "univ_uphf",
            title: "Université Polytechnique Hauts-de-France",
            description: "Utilise ton compte UPHF pour te connecter",
            image: require("@/../assets/images/service_uphf.png"),
            instanceURL: "https://appmob.uphf.fr/backend",
            navigate: function (instanceURL, title, image) { return navigation.navigate("Multi_Login", { instanceURL: instanceURL, title: title, image: image }); },
        },
        {
            name: "iut_lannion",
            title: "IUT de Lannion",
            description: "Utilise ton compte Université Rennes 1 pour te connecter",
            image: require("@/../assets/images/service_iutlan.png"),
            navigate: function () { return navigation.navigate("UnivIUTLannion_Login"); },
        },
    ];
    var identityProviders = [
        {
            name: "univ_rennes1",
            title: "Université Rennes 1",
            description: "Utilise ton compte Sésame pour te connecter",
            image: require("@/../assets/images/service_rennes1.png"),
            navigate: function () { return navigation.navigate("UnivRennes1_Login"); },
        },
        {
            name: "univ_rennes2",
            title: "Université Rennes 2",
            description: "Utilise ton compte Sésame pour te connecter",
            image: require("@/../assets/images/service_rennes2.png"),
            navigate: function () { return navigation.navigate("UnivRennes2_Login"); },
        },
        {
            name: "univ_sorbonne_paris_nord",
            title: "Université Sorbonne Paris Nord",
            description: "Utilise ton compte Sorbonne pour te connecter",
            image: require("@/../assets/images/service_uspn.png"),
            navigate: function () { return navigation.navigate("UnivSorbonneParisNord_login"); },
        },
    ];
    return (<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
      <NativeListHeader label="Services universitaires"/>

      <NativeList>
        {universityProviders.map(function (identityProvider) { return (<NativeItem key={identityProvider.name} onPress={function () { return identityProvider.navigate(identityProvider.instanceURL || "", identityProvider.title, identityProvider.image); }} leading={<Image source={identityProvider.image} style={{ width: 40, height: 40, borderRadius: 10 }}/>}>
            <NativeText variant="title">{identityProvider.title}</NativeText>
            <NativeText variant="subtitle">
              {identityProvider.description}
            </NativeText>
          </NativeItem>); })}
      </NativeList>

      <NativeListHeader label="Fonctionnalités limitées"/>

      <NativeList>
        <NativeItem icon={<Info />}>
          <NativeText variant="subtitle">
            Les founisseurs d'identité ne fournissent pas de données (calendrier, notes, etc...) mais permettent de te connecter à l'application.
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList>
        {identityProviders.map(function (identityProvider) { return (<NativeItem key={identityProvider.name} onPress={function () { return identityProvider.navigate(); }} leading={<Image source={identityProvider.image} style={{ width: 40, height: 40, borderRadius: 10 }}/>}>
            <NativeText variant="title">{identityProvider.title}</NativeText>
            <NativeText variant="subtitle">
              {identityProvider.description}
            </NativeText>
          </NativeItem>); })}
      </NativeList>
      <InsetsBottomView />

    </ScrollView>);
};
export default IdentityProviderSelector;
