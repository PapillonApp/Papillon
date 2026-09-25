//! Pont "WebView embarquée" pour le flux de connexion Pronote via ENT/CAS.
//!
//! Contexte : `react-native-webview` n'a aucun équivalent web, et le flux de
//! connexion Pronote (app/(onboarding)/services/pronote/browser.tsx côté JS)
//! a besoin d'injecter du JavaScript dans une page tierce (Pronote) et de
//! lire sa navigation — chose qu'un simple <iframe> ne peut PAS faire pour
//! du contenu cross-origin (sandbox du navigateur, aucun contournement
//! possible côté JS). On ouvre donc une vraie fenêtre WebView native
//! pilotée depuis Rust, avec le même niveau d'accès que la WebView native
//! sur mobile.
//!
//! ⚠️ Fichier le moins vérifié de tout le portage : pas de toolchain Rust
//! disponible dans l'environnement où ce projet a été préparé, donc rien
//! ici n'a été compilé ni testé contre un vrai flux de connexion Pronote.
//! Les méthodes utilisées (on_navigation, on_page_load, initialization_script,
//! on_ipc_handler, incognito, user_agent) sont des API Tauri 2.x réelles et
//! documentées ; leur exacte disponibilité sur `WebviewWindowBuilder` (plutôt
//! que sur le `WebviewBuilder` de plus bas niveau) est la seule zone
//! d'incertitude. Si `cargo build` râle sur l'une d'elles, se référer à
//! https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html
//! — la bascule vers `WebviewBuilder` + `window.add_child(...)` est la
//! solution de repli documentée par Tauri pour le même besoin.

use std::collections::HashMap;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

/// Registre des fenêtres WebView secondaires actuellement ouvertes, indexées
/// par l'identifiant de session généré côté JS (voir
/// web-shims/react-native-webview.web.tsx).
#[derive(Default)]
pub struct EmbeddedWebviews(pub Mutex<HashMap<String, WebviewWindow>>);

#[derive(Clone, Serialize)]
struct LoadPayload {
    phase: &'static str,
    url: Option<String>,
}

#[derive(Clone, Serialize)]
struct NavPayload {
    url: String,
    loading: bool,
}

/// Réinjecté dans CHAQUE page chargée par la WebView secondaire (via
/// `initialization_script`, exécuté avant tout script de la page elle-même,
/// à chaque navigation) : redonne vie à `window.ReactNativeWebView.postMessage`,
/// exactement l'API que le code applicatif existant utilise déjà pour
/// parler à une vraie react-native-webview.
const BRIDGE_INIT_SCRIPT: &str = r#"
(function () {
  if (window.ReactNativeWebView) return;
  window.ReactNativeWebView = {
    postMessage: function (data) {
      try { window.ipc.postMessage(String(data)); } catch (e) {}
    }
  };
})();
"#;

#[tauri::command]
pub async fn embedded_webview_open(
    app: AppHandle,
    state: tauri::State<'_, EmbeddedWebviews>,
    session_id: String,
    url: Option<String>,
    #[allow(unused_variables)] html: Option<String>,
    user_agent: Option<String>,
    incognito: bool,
    init_script: Option<String>,
) -> Result<(), String> {
    let Some(url) = url else {
        return Err("embedded_webview_open: aucune URL fournie (le contenu HTML direct n'est pas géré ici, ce cas ne survient pas dans le flux Pronote actuel)".into());
    };
    let target = url
        .parse()
        .map_err(|e| format!("URL invalide '{url}' : {e}"))?;

    let label = format!("embedded-{session_id}");

    let mut combined_init = BRIDGE_INIT_SCRIPT.to_string();
    if let Some(extra) = init_script {
        if !extra.trim().is_empty() {
            combined_init.push_str("\n;(function(){\n");
            combined_init.push_str(&extra);
            combined_init.push_str("\n})();\n");
        }
    }

    let nav_app = app.clone();
    let nav_session = session_id.clone();
    let load_app = app.clone();
    let load_session = session_id.clone();
    let msg_app = app.clone();
    let msg_session = session_id.clone();

    let mut builder = WebviewWindowBuilder::new(&app, &label, WebviewUrl::External(target))
        .title("Connexion — Papillon")
        .inner_size(480.0, 760.0)
        .initialization_script(&combined_init)
        .on_navigation(move |url| {
            let _ = nav_app.emit(
                &format!("embedded-webview://{nav_session}/navigation"),
                NavPayload { url: url.to_string(), loading: true },
            );
            // On ne bloque jamais une navigation : Pronote/le CAS de
            // l'établissement doit pouvoir rediriger librement (c'est
            // exactement ce que fait react-native-webview par défaut).
            true
        })
        .on_page_load(move |_webview, payload| {
            let phase = match payload.event() {
                tauri::webview::PageLoadEvent::Started => "start",
                tauri::webview::PageLoadEvent::Finished => "end",
            };
            let _ = load_app.emit(
                &format!("embedded-webview://{load_session}/load"),
                LoadPayload { phase, url: Some(payload.url().to_string()) },
            );
        })
        .on_ipc_handler(move |_webview, request| {
            // Relaie tel quel au frontend : c'est ici qu'arrivent les
            // window.ReactNativeWebView.postMessage(JSON.stringify(...))
            // du script injecté par browser.tsx (état de connexion Pronote,
            // erreurs, etc.)
            let body = String::from_utf8_lossy(request.body()).to_string();
            let _ = msg_app.emit(&format!("embedded-webview://{msg_session}/message"), body);
        });

    if let Some(ua) = user_agent {
        if !ua.trim().is_empty() {
            builder = builder.user_agent(&ua);
        }
    }
    if incognito {
        builder = builder.incognito(true);
    }

    let window = builder.build().map_err(|e| e.to_string())?;

    state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .insert(session_id, window);

    Ok(())
}

/// Sert à la fois à l'API impérative `injectJavaScript` du shim JS et à ses
/// équivalents `reload`/`goBack`/`goForward`/`stopLoading` (traduits côté JS
/// en `location.reload()`, `history.back()`, etc.)
#[tauri::command]
pub fn embedded_webview_eval(
    state: tauri::State<'_, EmbeddedWebviews>,
    session_id: String,
    script: String,
) -> Result<(), String> {
    let map = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(window) = map.get(&session_id) {
        window.eval(&script).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn embedded_webview_close(
    state: tauri::State<'_, EmbeddedWebviews>,
    session_id: String,
) -> Result<(), String> {
    let mut map = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(window) = map.remove(&session_id) {
        let _ = window.close();
    }
    Ok(())
}
