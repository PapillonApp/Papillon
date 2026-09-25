import { isTauriDesktop } from "@/utils/network/fetch";
import { startBackgroundNotificationSync as startBackgroundNotificationSyncWorker } from "@/utils/notificationSync";
import { useSettingsStore } from "@/stores/settings";
import type { NotificationPreferences } from "@/stores/settings/types";

type TrayAction = "pause-1h" | "pause-4h" | "pause-tomorrow" | "resume";

function updatePause(action: TrayAction): void {
  const personalization = useSettingsStore.getState().personalization;
  const current = personalization.notificationPreferences;
  if (!current) return;

  if (action === "resume") {
    useSettingsStore.getState().mutateProperty("personalization", {
      notificationPreferences: { ...current, pauseUntil: null, pauseIndefinitely: false },
    });
    return;
  }

  const resumeAt = new Date();
  if (action === "pause-1h") resumeAt.setHours(resumeAt.getHours() + 1);
  if (action === "pause-4h") resumeAt.setHours(resumeAt.getHours() + 4);
  if (action === "pause-tomorrow") {
    resumeAt.setDate(resumeAt.getDate() + 1);
    resumeAt.setHours(0, 0, 0, 0);
  }

  useSettingsStore.getState().mutateProperty("personalization", {
    notificationPreferences: {
      ...current,
      pauseUntil: resumeAt.toISOString(),
      pauseIndefinitely: false,
    },
  });
}

function keepHiddenWebviewAlive(): () => void {
  if (typeof navigator === "undefined" || !navigator.locks) return () => undefined;

  let release: (() => void) | null = null;
  const held = new Promise<void>(resolve => { release = resolve; });
  void navigator.locks.request("papillon-background-notifications", () => held).catch(error => {
    console.warn("The background WebView keep-alive could not be acquired.", error);
  });
  return () => {
    release?.();
    release = null;
  };
}

export function startDesktopBackground(): () => void {
  if (!isTauriDesktop()) return () => undefined;

  let releaseKeepAlive: (() => void) | null = null;
  let stopNotificationSync: (() => void) | null = null;
  let unlistenTray: (() => void) | null = null;
  let previousBackground = useSettingsStore.getState().personalization.desktopBackgroundOnClose ?? false;

  const setBackgroundMode = async (enabled: boolean) => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("set_background_on_close", { enabled });
    } catch (error) {
      console.warn("Unable to update the close-to-tray setting.", error);
    }

    if (enabled && !releaseKeepAlive) releaseKeepAlive = keepHiddenWebviewAlive();
    if (!enabled && releaseKeepAlive) {
      releaseKeepAlive();
      releaseKeepAlive = null;
    }
  };

  const stopSettingsListener = useSettingsStore.subscribe(state => {
    const personalization = state.personalization;
    const background = personalization.desktopBackgroundOnClose ?? false;
    if (background !== previousBackground) {
      previousBackground = background;
      void setBackgroundMode(background);
    }
  });

  void (async () => {
    try {
      const [{ invoke }, { getCurrentWindow }, { listen }] = await Promise.all([
        import("@tauri-apps/api/core"),
        import("@tauri-apps/api/window"),
        import("@tauri-apps/api/event"),
      ]);
      const currentWindow = getCurrentWindow();
      const preferences = useSettingsStore.getState().personalization;
      const startWithWindows = preferences.desktopStartWithWindows ?? false;
      const backgroundOnClose = preferences.desktopBackgroundOnClose ?? false;

      await setBackgroundMode(backgroundOnClose);
      try {
        const { enable, disable, isEnabled } = await import("@tauri-apps/plugin-autostart");
        const registered = await isEnabled();
        if (startWithWindows && !registered) await enable();
        if (!startWithWindows && registered) await disable();
      } catch (error) {
        console.warn("Unable to synchronize the Windows startup setting.", error);
      }

      let isAutostartLaunch = false;
      try {
        isAutostartLaunch = await invoke<boolean>("is_autostart_launch");
      } catch (error) {
        console.warn("Unable to detect an automatic Windows launch.", error);
      }

      if (!isAutostartLaunch || !backgroundOnClose) await currentWindow.show();

      try {
        unlistenTray = await listen<{ action: TrayAction }>("desktop-tray-action", event => {
          if (event.payload?.action) updatePause(event.payload.action);
        });
      } catch (error) {
        console.warn("Unable to listen for Windows tray actions.", error);
      }
      stopNotificationSync = startBackgroundNotificationSyncWorker();
    } catch (error) {
      console.error("Unable to start the Windows background features.", error);
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().show();
      } catch { }
    }
  })();

  return () => {
    stopSettingsListener();
    stopNotificationSync?.();
    unlistenTray?.();
    releaseKeepAlive?.();
    releaseKeepAlive = null;
  };
}

export function setNotificationPauseUntil(resumeAt: Date | null): void {
  const current = useSettingsStore.getState().personalization.notificationPreferences;
  if (!current) return;
  const next: NotificationPreferences = {
    ...current,
    pauseUntil: resumeAt?.toISOString() ?? null,
    pauseIndefinitely: false,
  };
  useSettingsStore.getState().mutateProperty("personalization", { notificationPreferences: next });
}
