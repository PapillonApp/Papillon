mod embedded_webview;

use embedded_webview::EmbeddedWebviews;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(EmbeddedWebviews::default())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            embedded_webview::embedded_webview_open,
            embedded_webview::embedded_webview_eval,
            embedded_webview::embedded_webview_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
