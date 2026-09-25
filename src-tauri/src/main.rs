// Hides the console window on release builds for Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;
use url::Url;

#[derive(Default)]
struct WindowPreferences {
    background_on_close: AtomicBool,
}

#[tauri::command]
fn set_background_on_close(enabled: bool, state: State<'_, WindowPreferences>) {
    state.background_on_close.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
fn is_autostart_launch() -> bool {
    std::env::args().any(|argument| argument == "--autostart")
}

#[tauri::command]
async fn open_pronote_ent_window(
    app: AppHandle,
    url: String,
    base_url: String,
    info_mobile_url: String,
    device_uuid: String,
) -> Result<(), String> {
    let target = Url::parse(&url).map_err(|error| error.to_string())?;
    if !matches!(target.scheme(), "http" | "https") {
        return Err("L'adresse PRONOTE doit commencer par http:// ou https://.".into());
    }
    let base = Url::parse(&base_url).map_err(|error| error.to_string())?;
    if !matches!(base.scheme(), "http" | "https") {
        return Err("L'adresse de l'établissement n'est pas valide.".into());
    }

    if let Some(existing) = app.get_webview_window("pronote-ent-login") {
        let _ = existing.close();
    }

    let info_mobile_url = info_mobile_url.clone();
    let device_for_script = serde_json::to_string(&device_uuid).map_err(|error| error.to_string())?;
    let school_url = serde_json::to_string(url.trim_end_matches('/')).map_err(|error| error.to_string())?;
    let info_script = format!(r#"
      (function () {{
        try {{
          const json = JSON.parse(document.body.innerText);
          const casToken = !!json && !!json.CAS && json.CAS.jetonCAS;
          const expires = new Date(Date.now() + 5 * 60 * 1000).toUTCString();
          const languageExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
          if (casToken) {{
            document.cookie = "appliMobile=; expires=" + new Date(0).toUTCString();
            document.cookie = "validationAppliMobile=" + casToken + "; expires=" + expires;
            document.cookie = "uuidAppliMobile=" + {device} + "; expires=" + expires;
          }} else {{
            document.cookie = "appliMobile=1; expires=" + expires;
          }}
          document.cookie = "ielang=1036; expires=" + languageExpires;
          window.location.assign({school} + "/mobile.eleve.html?fd=1");
        }} catch (_) {{}}
      }})();
    "#, device = device_for_script, school = school_url);
    let device_for_hook = device_for_script.clone();
    let login_hook = format!(r#"
      window.hookAccesDepuisAppli = function () {{
        this.passerEnModeValidationAppliMobile('', {device});
      }};
      try {{
        window.GInterface.passerEnModeValidationAppliMobile('', {device}, '', '', '{{"model":"random","platform":"windows"}}');
      }} catch (_) {{}}
    "#, device = device_for_hook);
    let state_script = r#"
      (function () {
        if (window.__papillonLoginStatePoller) return;
        window.__papillonLoginStatePoller = true;
        setInterval(function () {
          const state = window && window.loginState ? window.loginState : undefined;
          if (state) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pronote.loginState', data: state }));
        }, 1000);
      })();
    "#.to_string();
    let connection_error_script = r#"
      (function () {
        if (window.__papillonConnectionErrorWatcher) return;
        window.__papillonConnectionErrorWatcher = true;
        function notifyIfNeeded() {
          if (window.__papillonConnectionErrorSent) return;
          const text = (document.body && document.body.innerText || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          if (text.includes('connexion impossible') || text.includes('erreur')) {
            window.__papillonConnectionErrorSent = true;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pronote.connectionError' }));
          }
        }
        notifyIfNeeded();
        new MutationObserver(notifyIfNeeded).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      })();
    "#.to_string();
    let initialization_script = r#"
      window.ReactNativeWebView = {
        postMessage: function (message) {
          window.location.href = 'papillon-login://message?data=' + encodeURIComponent(String(message));
        }
      };
      document.addEventListener('click', function (event) {
        let element = event.target;
        while (element && element !== document) {
          if (element instanceof HTMLAnchorElement && element.target.toLowerCase() === '_blank') {
            const destination = new URL(element.href, window.location.href);
            if (destination.protocol === 'http:' || destination.protocol === 'https:') {
              event.preventDefault();
              window.open(destination.href, '_blank');
            }
            break;
          }
          element = element.parentElement;
        }
      }, true);
    "#;

    let app_for_navigation = app.clone();
    let page_base_url = base_url.clone();
    let page_info_url = info_mobile_url.clone();
    let page_login_hook = login_hook.clone();
    let page_state_script = state_script.clone();
    let page_error_script = connection_error_script.clone();

    WebviewWindowBuilder::new(&app, "pronote-ent-login", WebviewUrl::External(target))
        .title("Connexion à PRONOTE")
        .inner_size(980.0, 720.0)
        .initialization_script(initialization_script)
        .on_new_window(|navigation_url, _| {
            if matches!(navigation_url.scheme(), "http" | "https") {
                tauri::webview::NewWindowResponse::Allow
            } else {
                tauri::webview::NewWindowResponse::Deny
            }
        })
        .on_navigation(move |navigation_url| {
            if navigation_url.scheme() == "papillon-login" {
                if let Some((_, data)) = navigation_url.query_pairs().find(|(key, _)| key == "data") {
                    let _ = app_for_navigation.emit_to("main", "pronote-ent-message", data.to_string());
                }
                return false;
            }
            matches!(navigation_url.scheme(), "http" | "https")
        })
        .on_page_load(move |window, payload| {
            let loaded_url = payload.url().as_str();
            if loaded_url == page_info_url {
                let _ = window.eval(&info_script);
            } else if loaded_url.contains("mobile.eleve.html") {
                let _ = window.eval(&page_login_hook);
                let _ = window.eval(&page_state_script);
            } else if loaded_url.starts_with(&page_base_url) {
                let _ = window.eval(&page_login_hook);
                let _ = window.eval(&page_error_script);
            }
        })
        .build()
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
fn close_pronote_ent_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("pronote-ent-login") {
        let _ = window.close();
    }
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn create_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let open = MenuItem::with_id(app, "open", "Ouvrir Papillon", true, None::<&str>)?;
    let pause_one_hour = MenuItem::with_id(app, "pause-1h", "Suspendre les alertes 1 h", true, None::<&str>)?;
    let pause_four_hours = MenuItem::with_id(app, "pause-4h", "Suspendre les alertes 4 h", true, None::<&str>)?;
    let pause_tomorrow = MenuItem::with_id(app, "pause-tomorrow", "Suspendre jusqu'à demain", true, None::<&str>)?;
    let resume = MenuItem::with_id(app, "resume", "Reprendre les alertes", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quitter Papillon", true, None::<&str>)?;
    let separator_top = PredefinedMenuItem::separator(app)?;
    let separator_bottom = PredefinedMenuItem::separator(app)?;
    let menu = Menu::with_items(app, &[&open, &separator_top, &pause_one_hour, &pause_four_hours, &pause_tomorrow, &resume, &separator_bottom, &quit])?;
    let tray_app = app.handle().clone();

    TrayIconBuilder::new()
        .icon(app.default_window_icon().ok_or_else(|| std::io::Error::new(std::io::ErrorKind::Other, "Icône d'application absente"))?.clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => show_main_window(app),
            "pause-1h" => { let _ = app.emit("desktop-tray-action", serde_json::json!({ "action": "pause-1h" })); }
            "pause-4h" => { let _ = app.emit("desktop-tray-action", serde_json::json!({ "action": "pause-4h" })); }
            "pause-tomorrow" => { let _ = app.emit("desktop-tray-action", serde_json::json!({ "action": "pause-tomorrow" })); }
            "resume" => { let _ = app.emit("desktop-tray-action", serde_json::json!({ "action": "resume" })); }
            "quit" => app.exit(0),
            _ => (),
        })
        .on_tray_icon_event(move |_, event| {
            if matches!(event, TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. }) {
                show_main_window(&tray_app);
            }
        })
        .build(app)?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(WindowPreferences::default())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--autostart"])))
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            set_background_on_close,
            is_autostart_launch,
            open_pronote_ent_window,
            close_pronote_ent_window,
        ])
        .setup(|app| {
            create_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() != "main" { return; }
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.state::<WindowPreferences>().background_on_close.load(Ordering::Relaxed) {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Scola");
}
