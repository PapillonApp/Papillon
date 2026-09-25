import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Shim web/desktop pour `react-native-webview`.
//
// Ce paquet n'a aucun support web (0 fichier .web.*, TurboModule natif pur).
// Un simple <iframe> ne suffit PAS à remplacer son usage réel dans cette app
// (app/(onboarding)/services/pronote/browser.tsx) : ce flux injecte du JS
// dans la page Pronote elle-même et lit sa navigation, ce qu'un iframe ne
// permet pas pour du contenu cross-origin (sandbox du navigateur — aucun
// contournement possible en JS pur). On délègue donc à une vraie WebView
// secondaire pilotée côté Rust par Tauri (voir src-tauri/src/embedded_webview.rs),
// qui a le même niveau d'accès natif que react-native-webview sur mobile.
//
// ⚠️ Partie la moins testée de ce portage : je n'ai pas d'environnement
// Windows/WebView2 sous la main pour cliquer un vrai login Pronote via ENT
// de bout en bout. Le pont utilise des primitives Tauri documentées
// (WebviewWindowBuilder::on_navigation, ::initialization_script, Webview::eval,
// on_ipc_handler) mais mérite un vrai test manuel après build.
//
// Hors Tauri (aperçu navigateur classique), on affiche un message plutôt
// que de planter.

type NavState = {
  url: string;
  loading: boolean;
  title?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
};

export interface WebViewProps {
  source: { uri?: string; html?: string };
  style?: any;
  onNavigationStateChange?: (navState: NavState) => void;
  onLoadStart?: (e: { nativeEvent: { url: string } }) => void;
  onLoadEnd?: (e: { nativeEvent: { url: string } }) => void;
  onLoadProgress?: (e: { nativeEvent: { progress: number } }) => void;
  onMessage?: (e: { nativeEvent: { data: string } }) => void;
  onError?: (e: { nativeEvent: { description?: string } }) => void;
  onOpenWindow?: (e: { nativeEvent: { targetUrl: string } }) => void;
  injectedJavaScript?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  userAgent?: string;
  incognito?: boolean;
  startInLoadingState?: boolean;
}

export interface WebViewHandle {
  injectJavaScript: (js: string) => void;
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
  stopLoading: () => void;
}

declare global {
  interface Window {
    __TAURI__?: {
      core: { invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> };
      event: { listen: (event: string, cb: (e: { payload: any }) => void) => Promise<() => void> };
    };
  }
}

let sessionCounter = 0;

const WebView = React.forwardRef<WebViewHandle, WebViewProps>((props, ref) => {
  const {
    source,
    style,
    onNavigationStateChange,
    onLoadStart,
    onLoadEnd,
    onLoadProgress,
    onMessage,
    onError,
    onOpenWindow,
    injectedJavaScript,
    injectedJavaScriptBeforeContentLoaded,
    userAgent,
    incognito,
  } = props;

  const [sessionId] = React.useState(() => `wv-${Date.now()}-${sessionCounter++}`);
  const isTauri = typeof window !== "undefined" && !!window.__TAURI__;

  React.useImperativeHandle(
    ref,
    () => ({
      injectJavaScript: (js: string) => {
        if (isTauri) void window.__TAURI__!.core.invoke("embedded_webview_eval", { sessionId, script: js });
      },
      reload: () => {
        if (isTauri) void window.__TAURI__!.core.invoke("embedded_webview_eval", { sessionId, script: "location.reload();" });
      },
      goBack: () => {
        if (isTauri) void window.__TAURI__!.core.invoke("embedded_webview_eval", { sessionId, script: "history.back();" });
      },
      goForward: () => {
        if (isTauri) void window.__TAURI__!.core.invoke("embedded_webview_eval", { sessionId, script: "history.forward();" });
      },
      stopLoading: () => {
        if (isTauri) void window.__TAURI__!.core.invoke("embedded_webview_eval", { sessionId, script: "window.stop();" });
      },
    }),
    [isTauri, sessionId],
  );

  React.useEffect(() => {
    if (!isTauri || !window.__TAURI__) return;
    const tauri = window.__TAURI__;
    let cancelled = false;
    const unlisten: Array<() => void> = [];

    (async () => {
      unlisten.push(
        await tauri.event.listen(`embedded-webview://${sessionId}/navigation`, (e) => onNavigationStateChange?.(e.payload)),
      );
      unlisten.push(
        await tauri.event.listen(`embedded-webview://${sessionId}/message`, (e) =>
          onMessage?.({ nativeEvent: { data: e.payload } }),
        ),
      );
      unlisten.push(
        await tauri.event.listen(`embedded-webview://${sessionId}/open-window`, (e) =>
          onOpenWindow?.({ nativeEvent: { targetUrl: e.payload } }),
        ),
      );
      unlisten.push(
        await tauri.event.listen(`embedded-webview://${sessionId}/load`, (e) => {
          const { phase, url, progress, description } = e.payload;
          if (phase === "start") onLoadStart?.({ nativeEvent: { url } });
          if (phase === "end") onLoadEnd?.({ nativeEvent: { url } });
          if (phase === "progress") onLoadProgress?.({ nativeEvent: { progress } });
          if (phase === "error") onError?.({ nativeEvent: { description } });
        }),
      );

      if (!cancelled) {
        await tauri.core.invoke("embedded_webview_open", {
          sessionId,
          url: source?.uri ?? null,
          html: source?.html ?? null,
          userAgent: userAgent ?? null,
          incognito: !!incognito,
          initScript: injectedJavaScriptBeforeContentLoaded ?? "",
        });
        if (injectedJavaScript) {
          await tauri.core.invoke("embedded_webview_eval", { sessionId, script: injectedJavaScript });
        }
      }
    })();

    return () => {
      cancelled = true;
      unlisten.forEach((fn) => fn());
      void tauri.core.invoke("embedded_webview_close", { sessionId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTauri, sessionId, source?.uri, source?.html]);

  if (!isTauri) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>
          Cette connexion nécessite l'application de bureau Papillon (WebView native indisponible dans un simple aperçu navigateur).
        </Text>
      </View>
    );
  }

  // La vraie page s'affiche dans une fenêtre native superposée pilotée par
  // Rust (voir embedded_webview.rs) ; cette View ne fait que réserver
  // l'espace/servir de repère de positionnement.
  return <View style={[styles.container, style]} />;
});

WebView.displayName = "WebView";

const styles = StyleSheet.create({
  container: { backgroundColor: "transparent" },
  fallback: { alignItems: "center", justifyContent: "center", padding: 24 },
  fallbackText: { textAlign: "center", opacity: 0.7 },
});

export default WebView;
