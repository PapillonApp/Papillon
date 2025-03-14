import { Skolengo, OID_CLIENT_ID, OID_CLIENT_SECRET, BASE_URL } from "scolengo-api";
import { SkolengoAuthConfig, SkolengoJWT, SkolengoTokenSet, authTokenToSkolengoTokenSet } from "./skolengo-types";
import { DiscoveryDocument } from "expo-auth-session";
import { SkolengoAccount, AccountService } from "@/stores/account/types";
import axios, { type AxiosResponse } from "axios";
import { decode as b64decode, encode as b64encode} from "js-base64";
import { decode as htmlDecode } from "html-entities";
import { useCurrentAccount } from "@/stores/account";
import defaultSkolengoPersonalization from "./default-personalization";
import { User } from "scolengo-api/types/models/Common";
import { Alert } from "react-native";

const getSkolengoAxiosInstance = () => {
  const axioss = axios.create({
    baseURL: BASE_URL
  });

  axioss.interceptors.response.use(
    (r: AxiosResponse) => r,
    (error) => {
      if (error.response?.data?.errors?.find((e: any) => e.title.includes("PRONOTE_RESOURCES"))) {
        return Promise.reject(error);
      }

      if (__DEV__) {
        console.warn(
          "[SKOLENGO] ERR - ",
          JSON.stringify(error, null, 2),
          JSON.stringify(error.response?.data, null, 2)
        );
      }

      error.response?.data?.errors?.forEach((e: any) => {
        if (!e["title"] || e["title"] === "FORBIDDEN") return;

        Alert.alert(
          "Skolengo - " + (e["title"].toString() || "Erreur"),
          htmlDecode(e["detail"]?.toString().replace(/<(\/)?([a-z0-9]+)>/g, "") || "Erreur inconnue") +
            "\n\nSi cette erreur persiste, contacte les équipes de Papillon.",
          [{ text: "OK" }]
        );
      });

      return Promise.reject(error);
    }
  );

  return axioss;
};

export const refreshSkolengoToken = async (refreshToken: string, discovery: DiscoveryDocument): Promise<SkolengoTokenSet> => {
  const formData = new FormData();

  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);

  if(!discovery.tokenEndpoint) throw new Error("[SKOLENGO] ERR - No token endpoint in discovery document");

  return await fetch(discovery.tokenEndpoint, {
    method: "POST",
    headers: {
      Authorization: "Basic "+b64encode(OID_CLIENT_ID + ":" + OID_CLIENT_SECRET),
    },
    body: formData
  }).then((response) => response.json()).then(d => authTokenToSkolengoTokenSet(d));
};

const getJWTClaims = (token: string): SkolengoJWT => {
  const dataPart = token.split(".")?.at(1)?.replace(/-/g, "+").replace(/_/g, "/");
  if(!dataPart) throw new Error("[SKOLENGO] ERR - No data part in token");
  const data = JSON.parse(b64decode(dataPart));
  return data;
};

export const getSkolengoAccount = async (authConfig: SkolengoAuthConfig, userInfo?: User)=>{
  const skolengoAccount = new Skolengo(
    null,
    authConfig.school,
    authConfig.tokenSet,
    {
      refreshToken: async (tokenSet): Promise<SkolengoTokenSet> =>
      {
        if(!tokenSet.refresh_token) throw new Error("[SKOLENGO] ERR - No refresh token");
        return refreshSkolengoToken(tokenSet.refresh_token, authConfig.discovery);
      },
      onTokenRefresh: async (tokenSet) => {
        const state = useCurrentAccount.getState().account?.authentication as SkolengoAccount["authentication"];
        useCurrentAccount.getState().mutateProperty("authentication", {
          ...state,
          tokenSet
        });
      },
      httpClient: getSkolengoAxiosInstance(),
      handlePronoteError: true
    }
  );
  if(!userInfo) userInfo = await skolengoAccount.getUserInfo();
  const jwtDecoded = getJWTClaims(skolengoAccount.tokenSet.id_token!);
  const account: SkolengoAccount = {
    service: AccountService.Skolengo,
    localID: userInfo?.id || jwtDecoded.sub,
    isExternal: false,
    name: jwtDecoded.given_name + " " + jwtDecoded.family_name,
    instance: skolengoAccount,
    authentication: {
      school: authConfig.school,
      tokenSet: skolengoAccount.tokenSet,
      discovery: authConfig.discovery
    },
    linkedExternalLocalIDs: [],
    studentName: {
      first: userInfo?.firstName|| jwtDecoded.given_name || "Inconnu",
      last: userInfo?.lastName|| jwtDecoded.family_name || "Inconnu",
    },
    schoolName: userInfo?.school?.name,
    className: userInfo?.className,
    personalization: await defaultSkolengoPersonalization(skolengoAccount),
    userInfo,
    identity: {},
    providers: [],
    serviceData: {}
  };
  return account;
};
