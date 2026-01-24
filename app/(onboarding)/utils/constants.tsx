/* eslint-disable @typescript-eslint/no-require-imports */
import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { RelativePathString, UnknownInputParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, ViewStyle } from 'react-native';

import { Services } from '@/stores/account/types';
export interface SupportedService {
  name: string;
  title: string;
  type: string;
  image?: NodeRequire;
  onPress: () => void;
  variant: string;
  color?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GetSupportedServices(redirect: (path: { pathname: string, options?: UnknownInputParams }) => void): SupportedService[] {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation()

  return [
    {
      name: "pronote",
      title: "PRONOTE",
      type: "main",
      image: require("@/assets/images/service_pronote.png"),
      onPress: () => {
        redirect({ pathname: './school/method', options: { service: Services.PRONOTE } });
      },
      variant: 'service' as const,
      color: 'light' as const,
    },
    {
      name: "ed",
      title: "ÉcoleDirecte",
      type: "main",
      image: require("@/assets/images/service_ed.png"),
      onPress: () => {
        redirect({ pathname: './ecoledirecte/credentials', options: { service: Services.ECOLEDIRECTE } });
      },
      variant: 'service' as const,
      color: 'light' as const,
    },
    {
      name: "skolengo",
      title: "Skolengo",
      type: "main",
      image: require("@/assets/images/service_skolengo.png"),
      onPress: () => {
        redirect({ pathname: './school/method', options: { service: Services.SKOLENGO } });
      },
      variant: 'service' as const,
      color: 'light' as const,
    },
    {
      name: "separator",
      title: "separator",
      type: "separator",
      image: require("@/assets/images/service_skolengo.png"),
      onPress: () => { /* empty */ },
      variant: 'service' as const,
      color: 'light' as const,
    },
    {
      name: "university",
      title: t("ONBOARDING_UNIVERSITY"),
      type: "other",
      icon: <Papicons name={"Star"} />,
      onPress: () => {
        redirect({ pathname: './university/method' });
      },
      variant: 'primary' as const,
      style: { backgroundColor: theme.dark ? colors.border : "black" },
    },
    {
      name: "university",
      title: t("ONBOARDING_RESTAURANTS"),
      type: "other",
      icon: <Papicons name={"Cutlery"} />,
      onPress: () => {
        redirect({ pathname: './restaurants/method' });
      },
      variant: 'primary' as const,
      color: 'light' as const
    }
  ]
}

export interface SupportedUniversity {
  name: string;
  title: string;
  hasLimitedSupport: boolean;
  image?: NodeRequire;
  type: string;
  onPress: () => void;
}

export function GetSupportedUniversities(redirect: (path: { pathname: string, options?: UnknownInputParams }) => void): SupportedUniversity[] {
  const { t } = useTranslation();

  return [
    {
      name: "iut-lannion",
      title: "IUT de Lannion",
      hasLimitedSupport: false,
      image: require("@/assets/images/univ_lannion.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: './lannion/credentials' });
      },
    },
    {
      name: "univ-lorraine",
      title: "Université de Lorraine",
      hasLimitedSupport: false,
      image: require("@/assets/images/univ_lorraine.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: './multi/credentials', options: { color: "#000000", university: "ULorraine", url: "https://mobile-back.univ-lorraine.fr" } });
      },
    },
    {
      name: "univ-nimes",
      title: "Université de Nîmes",
      hasLimitedSupport: false,
      image: require("@/assets/images/univ_nimes.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: './multi/credentials', options: { color: "#FF341B", university: "UNîmes", url: "https://mobile-back.unimes.fr" } });
      },
    },
    {
      name: "univ-uphf",
      title: "Université Polytechnique Hauts-de-France",
      hasLimitedSupport: false,
      image: require("@/assets/images/univ_uphf.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: './multi/credentials', options: { color: "#008DB0", university: "UPHF", url: "https://appmob.uphf.fr/backend" } });
      },
    },
    {
      name: "appscho",
      title: "Autres universités",
      hasLimitedSupport: false,
      type: "other",
      onPress: () => { redirect({ pathname: './appscho/list' }) }
    },

    /*{
      name: "limited-functions",
      title: t("Feature_Limited"),
      hasLimitedSupport: true,
      image: require("@/assets/images/univ_lannion.png"),
      type: "separator",
      onPress: () => { }
    },
    {
      name: "univ-rennes-1",
      title: "Université de Rennes 1",
      hasLimitedSupport: true,
      image: require("@/assets/images/univ_rennes1.png"),
      type: "main",
      onPress: () => { }
    },
    {
      name: "univ-rennes-2",
      title: "Université de Rennes 2",
      hasLimitedSupport: true,
      image: require("@/assets/images/univ_rennes2.png"),
      type: "main",
      onPress: () => { }
    },
    {
      name: "univ-limoges",
      title: "Université de Limoges",
      type: "main",
      hasLimitedSupport: true,
      image: require("@/assets/images/univ_limoges.png"),
      onPress: () => { }
    },
    {
      name: "univ_paris_sorbonne",
      title: "Université de Sorbonne Paris Nord",
      hasLimitedSupport: true,
      image: require("@/assets/images/univ_paris_sorbonne.png"),
      type: "main",
      onPress: () => { }
    } */
  ]
}

export interface LoginMethod {
  id: string,
  availableFor: Array<Services>,
  description: string,
  icon: React.ReactNode,
  onPress: () => void;
}

export function GetLoginMethods(redirect: (path: { pathname: RelativePathString }) => void): LoginMethod[] {
  const { t } = useTranslation();

  return [
    {
      id: "map",
      availableFor: [Services.PRONOTE, Services.SKOLENGO],
      description: t("ONBOARDING_METHOD_POSITION"),
      icon: <Papicons name={"MapPin"} />,
      onPress: async () => {
        redirect({ pathname: './map' });
      }
    },
    {
      id: "search",
      availableFor: [Services.PRONOTE, Services.SKOLENGO],
      description: t("ONBOARDING_METHOD_SEARCH"),
      icon: <Papicons name={"Search"} />,
      onPress: () => {
        redirect({ pathname: './search' })
      }
    },
    {
      id: "qrcode",
      availableFor: [Services.PRONOTE],
      description: t("ONBOARDING_METHOD_QRCODE"),
      icon: <Papicons name={"QrCode"} />,
      onPress: () => {
        redirect({ pathname: "/(onboarding)/pronote/qrcode" });
      }
    },
    {
      id: "url",
      availableFor: [Services.PRONOTE],
      description: t("ONBOARDING_METHOD_LINK"),
      icon: <Papicons name={"Link"} />,
      onPress: () => {
        redirect({ pathname: '../pronote/url' });
      }
    }
  ]
}

export interface SupportedRestaurant {
  name: string;
  title: string;
  hasLimitedSupport: boolean;
  image: any;
  type: string;
  onPress: () => void;
}

export function GetSupportedRestaurants(redirect: (path: { pathname: string }) => void): SupportedRestaurant[] {
  return [
    {
      name: "turboself",
      title: "TurboSelf",
      hasLimitedSupport: false,
      image: require("@/assets/images/turboself.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: '../turboself/credentials' });
      }
    },
    {
      name: "ard",
      title: "ARD",
      hasLimitedSupport: false,
      image: require("@/assets/images/ard.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: '../ard/credentials' });
      }
    },
    {
      name: "izly",
      title: "Izly",
      hasLimitedSupport: false,
      image: require("@/assets/images/izly.png"),
      type: "main",
      onPress: () => {
        redirect({ pathname: '../izly/credentials' });
      }
    },
    {
      name: "alise",
      title: "Alise",
      hasLimitedSupport: false,
      image: require("@/assets/images/alise.jpg"),
      type: "main",
      onPress: () => {
        redirect({ pathname: '../alise/credentials' });
      }
    }
  ]
}