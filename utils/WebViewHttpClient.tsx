import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { warn } from "./logger/logger";

export type HttpRequest = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
  headers?: Record<string, string>;
  body?: string;
  redirect?: "follow" | "manual";
  preNavigate?: boolean;
};

export type HttpResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  type: string;
  headers: Record<string, string | string[]>;
  body: string;
  cookies: Record<string, string>;
  notes?: string[];
};

export type WebViewHttpClientHandle = {
  request(req: HttpRequest): Promise<HttpResponse>;
};

// Constants for performance
const ORIGIN_WHITELIST = ["*"];

const INJECTED_BOOT = `
(function() {
  function headersToObject(headers) {
    const out = {};
    try { headers.forEach((v,k)=>{ (out[k] ||= []).push(v); }); } catch {}
    return out;
  }
  function readCookies() {
    try { return document.cookie || ""; } catch(e) { return ""; }
  }
  function parseCookieString(s) {
    const out = {};
    String(s||"").split(";").map(x=>x.trim()).forEach(kv=>{
      const i=kv.indexOf("="); if(i>0){ out[kv.slice(0,i)] = kv.slice(i+1); }
    });
    return out;
  }
  async function doFetch(msg) {
    const log=[];
    const opts={ method: msg.method||"GET", headers: msg.headers||{}, redirect: msg.redirect||"follow" };
    if (msg.body != null) opts.body = msg.body;
    log.push("[doFetch] "+opts.method+" "+msg.url+" redirect="+opts.redirect);
    try{
      const res = await fetch(msg.url, opts);
      const headers = headersToObject(res.headers);
      const cookies = parseCookieString(readCookies()); // non-HttpOnly
      const body = await res.text();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        t:"result",
        ok: res.ok, status: res.status, statusText: res.statusText, url: res.url, type: res.type,
        headers, body, cookies, notes: log
      }));
    }catch(e){
      window.ReactNativeWebView.postMessage(JSON.stringify({ t:"error", message:String(e), notes:log }));
    }
  }
  function preNavigate(url){
    try{ location.href = url; } catch(e){
      window.ReactNativeWebView.postMessage(JSON.stringify({ t:"error", message:"preNavigate failed: "+String(e) }));
    }
  }
  window.addEventListener("message", (ev)=>{
    try{
      const msg = JSON.parse(ev.data);
      if (!msg || typeof msg !== "object") return;
      if (msg.t === "pre") return preNavigate(msg.url);
      if (msg.t === "fetch") return doFetch(msg);
    }catch{}
  });
  window.ReactNativeWebView.postMessage(JSON.stringify({ t:"ready", href: location.href }));
})();
true;
`;


export const WebViewHttpClient = React.memo(forwardRef<WebViewHttpClientHandle>((_props, ref) => {
  const wvRef = useRef<WebView>(null);
  const pendingRef = useRef<{ resolve: (r: HttpResponse) => void; reject: (e: unknown) => void; } | null>(null);

  useImperativeHandle(ref, () => ({
    request: (req: HttpRequest) => new Promise((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      const msg = {
        t: "fetch",
        url: req.url,
        method: req.method || "GET",
        headers: req.headers || {},
        redirect: req.redirect || "follow",
        body: req.body ?? null,
      };
      if (req.preNavigate) {
        wvRef.current?.postMessage(JSON.stringify({ t: "pre", url: req.url }));
        setTimeout(() => wvRef.current?.postMessage(JSON.stringify(msg)), 300);
      } else {
        wvRef.current?.postMessage(JSON.stringify(msg));
      }
    }),
  }), []);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.t === "result") {
        pendingRef.current?.resolve?.({
          ok: !!data.ok,
          status: data.status,
          statusText: data.statusText,
          url: data.url,
          type: data.type,
          headers: data.headers || {},
          body: data.body || "",
          cookies: data.cookies || {},
          notes: data.notes || [],
        });
        pendingRef.current = null;
      } else if (data.t === "error") {
        pendingRef.current?.reject?.(new Error(data.message || "WebView request error"));
        pendingRef.current = null;
      }
    } catch (err) {
      warn(`WebView message parse error: ${String(err)}`);
    }
  }, []);

  const htmlSource = useMemo(() => ({
    html: "<!DOCTYPE html><html><head><meta name='viewport' content='width=1,initial-scale=1'><style>*{margin:0;padding:0}body{background:transparent}</style></head><body></body></html>"
  }), []);

  const handleLoadRequest = useCallback((req: { url: string }) => {
    const scheme = req.url.split(":")[0]?.toLowerCase();
    return scheme === "http" || scheme === "https" || req.url === "about:blank";
  }, []);

  return (
    <View style={styles.container} pointerEvents="none" collapsable={false}>
      <WebView
        ref={wvRef}
        source={htmlSource}
        style={styles.wv}
        originWhitelist={ORIGIN_WHITELIST}
        javaScriptEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        injectedJavaScript={INJECTED_BOOT}
        onMessage={onMessage}
        allowsInlineMediaPlayback={false}
        mediaPlaybackRequiresUserAction
        onShouldStartLoadWithRequest={handleLoadRequest}
        // Performance optimizations
        cacheEnabled={false}
        incognito={false}
        androidLayerType="hardware"
        nestedScrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}));

WebViewHttpClient.displayName = "WebViewHttpClient";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
    zIndex: -9999,
    overflow: "hidden"
  },
  wv: {
    width: 0,
    height: 0,
    opacity: 0,
    backgroundColor: "transparent"
  },
});
