import { ArrowRightBox, Cross } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PathProps } from "react-native-svg/src/elements/Path";

import { AvailableTransportServices } from "@/constants/AvailableTransportServices";
import * as TransitService from "@/services/transit";
import { TransportAddress } from "@/stores/account/types";
import Typography from "@/ui/components/Typography";

const TransitLogo = (props: PathProps) => (
  <Svg width={12} height={12} fill="none" viewBox="0 0 14 14">
    <Path
      {...props}
      fillOpacity={0.5}
      fillRule="evenodd"
      d="M9.713 0A3.887 3.887 0 0 1 13.6 3.885l.001.984v.294c0 .035-.034.056-.062.04a2.416 2.416 0 0 0-1.136-.28c-.41 0-.797.1-1.137.28a.045.045 0 0 1-.061-.016.045.045 0 0 1-.006-.023v-.293l-.003-.983a1.485 1.485 0 0 0-2.542-1.07 1.484 1.484 0 0 0-.425 1.068v.064l-.026 5.212v.111a3.887 3.887 0 0 1-7.774.001v-.869l-.002-.409c0-.035.034-.056.063-.04.34.18.726.281 1.136.281.41 0 .797-.101 1.136-.281a.045.045 0 0 1 .068.04l.001.407v.255l.002.612a1.484 1.484 0 1 0 2.967.003V9.21c.003-.563.022-4.7.026-5.26v-.064A3.887 3.887 0 0 1 9.713 0Zm3.87 9.546v.384l.001.207.003 1.49a1.201 1.201 0 1 1-2.403.006l-.003-1.496v-.593c0-.03.034-.053.066-.036.337.178.721.28 1.129.28.412 0 .8-.099 1.141-.28.029-.016.066.003.066.038ZM12.38 5.733a1.621 1.621 0 0 1 1.144 2.764 1.621 1.621 0 0 1-2.289 0 1.621 1.621 0 0 1 0-2.29 1.621 1.621 0 0 1 1.145-.474ZM1.62 4.187A1.621 1.621 0 0 1 2.764 6.95a1.621 1.621 0 0 1-2.29 0 1.621 1.621 0 0 1 .001-2.29 1.622 1.622 0 0 1 1.145-.474ZM1.619.325a1.201 1.201 0 0 1 1.204 1.2l.004 1.602v.485c0 .031-.035.053-.066.037a2.418 2.418 0 0 0-1.13-.28c-.412 0-.8.099-1.141.28-.028.015-.065-.002-.065-.037v-.293l-.001-.192L.42 1.53A1.201 1.201 0 0 1 1.62.325Z"
      clipRule="evenodd"
    />
  </Svg>
);

const Dot = (params: { opacity: number }): React.ReactNode => {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 7,
        height: 7,
        borderRadius: 7,
        backgroundColor: theme.colors.text,
        opacity: params.opacity,
      }}
    />
  );
};

export interface TransitProps {
  isDeparture: boolean;
  homeAddress?: TransportAddress;
  schoolAddress?: TransportAddress;
  targetTime: number;
  service: string;
}

export const Transit = ({
  isDeparture,
  homeAddress,
  schoolAddress,
  targetTime,
  service,
}: TransitProps): React.ReactNode | null => {
  const transit: TransitService.default = new TransitService.default();
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [status] = Location.useForegroundPermissions();

  const [routeFound, setRouteFound] = React.useState(false);
  const [error, setError] = React.useState<{
    title: string;
    description: string;
  } | null>(null);
  const [routeStartTime, setRouteStartTime] = React.useState(0);

  const getTransportResult = async () => {
    if (service !== "transit") {
      return;
    }
    try {
      if (schoolAddress === undefined || homeAddress === undefined) {
        throw new Error("Transport_Error_Address_Not_Set");
      }

      const from = isDeparture ? homeAddress : schoolAddress;
      const to = isDeparture ? schoolAddress : homeAddress;

      if (to.firstTitle === "current_location") {
        throw new Error("Transport_Error_Cant_Go_To_Current_Location");
      }

      const departureLocation = await getFromLocation(from);
      const routeOption: {
        locale: string;
        arrivalTime?: number;
        leaveTime?: number;
      } = { locale: "fr" };

      if (isDeparture) {
        routeOption.arrivalTime = targetTime;
      } else {
        routeOption.leaveTime = targetTime;
      }

      const routes = await transit.plan(
        departureLocation.latitude,
        departureLocation.longitude,
        to.latitude,
        to.longitude,
        routeOption
      );

      if (routes.results.length > 0) {
        setRouteFound(true);
        setRouteStartTime(parseInt(routes.results[0].start_time));
      }
    } catch (e: unknown) {
      setError({
        title: `${(e as Error).message}_Title`,
        description: `${(e as Error).message}_Description`,
      });
    }
  };

  const formatStartTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date().getTime();
    const toNow = (date.getTime() - now);

    const minutes = Math.floor(toNow / 60);
    const hours = Math.floor(toNow / (60 * 60));

    if (hours < 1) {
      return `${t("Transport_Leave_In")} ${minutes}min - ${t("Transport_From")}`;
    } else if (hours < 2) {
      return `${t("Transport_Leave_In")} ${hours}h${minutes} - ${t("Transport_From")}`;
    }

    return `${t("Transport_Leave_At")} ${date.toLocaleTimeString("fr-FR", { hour: "numeric", minute: "numeric" })} - ${t("Transport_From")}`;
  };

  const getFromLocation = async (
    from: TransportAddress
  ): Promise<{
    longitude: number;
    latitude: number;
  }> => {
    if (from.firstTitle === "current_location") {
      if (!status?.granted) {
        throw new Error("Transport_Error_Location");
      }
      const location = await Location.getCurrentPositionAsync();

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }
    return {
      latitude: from.latitude,
      longitude: from.longitude,
    };
  };

  useEffect(() => {
    if (status !== null) {
      getTransportResult();
    }
  }, [status]);

  if (homeAddress === undefined || schoolAddress === undefined) {
    return null;
  }

  if (homeAddress.firstTitle === "current_location" && !isDeparture) {
    return null;
  }

  return (
    <TouchableOpacity
      style={{
        height: 60,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
      }}
      onPress={() => {
        router.push("/(settings)/about");
      }}
    >
      <View
        style={{
          width: 57,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexDirection: isDeparture ? "column" : "column-reverse",
        }}
      >
        <Dot opacity={theme.dark ? 0.2 : 0.05} />
        <Dot opacity={theme.dark ? 0.25 : 0.1} />
        <Dot opacity={theme.dark ? 0.3 : 0.2} />
      </View>
      {error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              marginBottom: -5,
            }}
          >
            <Cross color={theme.colors.text + "9F"} />
            <Typography
              variant={"h5"}
              color={theme.colors.text + "9F"}
              inline={true}
              numberOfLines={1}
              style={{ width: "90%" }}
            >
              {error.title}
            </Typography>
          </View>
          <Typography
            variant={"caption"}
            color={"secondary"}
            numberOfLines={1}
            style={{ width: "100%" }}
          >
            {error.description}
          </Typography>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              marginBottom: -5,
            }}
          >
            <ArrowRightBox color={theme.colors.text + "9F"} />
            <Typography
              variant={"h5"}
              color={theme.colors.text + "9F"}
              inline={true}
            >
              {isDeparture ? schoolAddress.firstTitle : homeAddress.firstTitle}
            </Typography>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Typography variant={"caption"} color={"secondary"}>
              {routeFound
                ? `${formatStartTime(routeStartTime)}`
                : t("Transport_Open_In")}
            </Typography>
            {service === "transit" && <TransitLogo fill={theme.colors.text} />}
            <Typography variant={"caption"} color={"secondary"}>
              {AvailableTransportServices.find((el) => el.id === service)?.name ?? t("Transport_Maps_App")}
            </Typography>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
