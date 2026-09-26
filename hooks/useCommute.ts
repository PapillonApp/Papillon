import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Course } from "@/services/shared/timetable";
import { client } from "@/services/transport/client";
import { LocationUnavailableError } from "@/services/transport/errors";
import { load } from "@/services/transport/loadCommute";
import type { CommuteDirection, CommuteState, LatLon } from "@/services/transport/types";
import { useAccountStore } from "@/stores/account";
import { useTransportStore } from "@/stores/transport";
import { error as logError, warn } from "@/utils/logger/logger";

const LAST_KNOWN_MAX_AGE_MS = 5 * 60_000;

async function getLocationPermission(): Promise<"granted" | "denied"> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return "granted";
  }
  if (current.canAskAgain && current.status === Location.PermissionStatus.UNDETERMINED) {
    const requested = await Location.requestForegroundPermissionsAsync();
    return requested.granted ? "granted" : "denied";
  }
  return "denied";
}

async function getCurrentPosition(): Promise<LatLon> {
  try {
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: position.coords.latitude, lon: position.coords.longitude };
  } catch (cause) {
    throw new LocationUnavailableError(cause);
  }
}

interface UseCommuteInput {
  day: Date;
  courses: Course[];
  direction: CommuteDirection;
  refreshToken: number;
}

export function useCommute({ day, courses, direction, refreshToken }: UseCommuteInput) {
  const account = useAccountStore(state => state.accounts.find(a => a.id === state.lastUsedAccount));
  const [state, setState] = useState<CommuteState>({ kind: "hidden" });
  const [retryToken, setRetryToken] = useState(0);
  const lastTokens = useRef({ refreshToken, retryToken });

  const coursesSignature = useMemo(
    () => courses.map(c => `${c.id}:${c.from.getTime()}:${c.to.getTime()}:${c.status}:${c.type}`).join("|"),
    [courses]
  );

  useEffect(() => {
    let active = true;
    const force =
      lastTokens.current.refreshToken !== refreshToken || lastTokens.current.retryToken !== retryToken;
    lastTokens.current = { refreshToken, retryToken };

    const store = useTransportStore.getState();
    load({
      now: new Date(),
      accountId: account?.id ?? "",
      day,
      courses,
      direction,
      transport: account?.transport,
      force,
      getCachedEntry: key => useTransportStore.getState().entries[key],
      putCachedEntry: (key, entry) => useTransportStore.getState().put(key, entry),
      blockedUntil: store.blockedUntil ? new Date(store.blockedUntil) : undefined,
      setBlockedUntil: date => useTransportStore.getState().setBlockedUntil(date),
      getLocationPermission,
      getCurrentPosition,
      plan: query => client().plan(query),
      onLoading: () => {
        if (active) {
          setState({ kind: "loading" });
        }
      },
      log: (level, message) => (level === "error" ? logError(message) : warn(message)),
    }).then(next => {
      if (active && next) {
        setState(next);
      }
    });

    return () => {
      active = false;
    };
  }, [account?.id, account?.transport, day.getTime(), coursesSignature, direction, refreshToken, retryToken]);

  const refresh = useCallback(() => setRetryToken(token => token + 1), []);

  return { state, refresh };
}
