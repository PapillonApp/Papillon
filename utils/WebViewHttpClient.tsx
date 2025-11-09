import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

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

export const WebViewHttpClient = forwardRef<WebViewHttpClientHandle>((_props, ref) => {
  const wvRef = useRef<WebView>(null);
  const [pending, setPending] = useState<{ resolve?: (r: HttpResponse) => void; reject?: (e: any) => void; }>({});

  useImperativeHandle(ref, () => ({
    request: (req: HttpRequest) => new Promise((resolve, reject) => {
      setPending({ resolve, reject });
      const msg = {
        t: req.preNavigate ? "pre" : "fetch",
        url: req.url,
        method: req.method || "GET",
        headers: req.headers || {},
        redirect: req.redirect || "follow",
        body: req.body ?? null,
      };
      if (req.preNavigate) {
        wvRef.current?.postMessage(JSON.stringify({ t: "pre", url: req.url }));
        setTimeout(() => wvRef.current?.postMessage(JSON.stringify({ t: "fetch", ...msg })), 300);
      } else {
        wvRef.current?.postMessage(JSON.stringify({ t: "fetch", ...msg }));
      }
    }),
  }));

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.t === "result") {
        pending.resolve?.({
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
        setPending({});
      } else if (data.t === "error") {
        pending.reject?.(new Error(data.message || "WebView request error"));
        setPending({});
      }
    } catch { }
  };

  return (
    <WebView
      ref={wvRef}
      source={{ uri: "about:blank" }}
      style={styles.wv}
      originWhitelist={["*"]}
      javaScriptEnabled
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      injectedJavaScript={INJECTED_BOOT}
      onMessage={onMessage}
      onShouldStartLoadWithRequest={(req) => {
        const scheme = req.url.split(":")[0]?.toLowerCase();
        if (scheme !== "http" && scheme !== "https" && req.url !== "about:blank") return false;
        return true;
      }}
    />
  );
});

const styles = StyleSheet.create({
  wv: { position: "absolute", width: 1, height: 1, opacity: 0 },
});
