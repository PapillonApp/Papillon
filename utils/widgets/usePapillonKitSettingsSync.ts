import * as PapillonKit from "@getpapillon/papillonkit";
import { useEffect, useRef } from "react";

import { useSettingsStore } from "@/stores/settings";
import { warn } from "@/utils/logger/logger";

const useSettingsSync = () => {
  const liveActivitiesEnabled = useSettingsStore(state => state.personalization.liveActivitiesEnabled);
  const liveActivityTestMode = useSettingsStore(state => state.personalization.liveActivityTestMode);
  const fontFamily = useSettingsStore(state => state.personalization.fontFamily);
  const language = useSettingsStore(state => state.personalization.language);
  const colorSelected = useSettingsStore(state => state.personalization.colorSelected);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    PapillonKit.refresh().catch(error => warn(`PapillonKit refresh failed: ${error}`));
  }, [liveActivitiesEnabled, liveActivityTestMode, fontFamily, language, colorSelected]);
};

export const usePapillonKitSettingsSync = PapillonKit.isSupported ? useSettingsSync : () => {};
