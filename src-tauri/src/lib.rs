mod geo_spark;

use crate::geo_spark::shapefile_to_geojson::convert;
use crate::geo_spark::stream_file::get_stream_response;
use crate::geo_spark::tle_czml::tle_generate_czml;
use detect_desktop_environment::DesktopEnvironment;
use tauri::{
    Manager, State, WindowEvent,
    http::{StatusCode, header, response::Builder as ResponseBuilder},
};

#[tauri::command]
fn update_login_state(state: State<geo_spark::states::AppData>, value: bool) {
    state.set_login(value)
}

#[tauri::command]
fn get_desktop_environment() -> String {
    if let Some(desktop) = DesktopEnvironment::detect() {
        match desktop {
            DesktopEnvironment::Kde => "kde".to_string(),
            DesktopEnvironment::Windows => "windows".to_string(),
            DesktopEnvironment::MacOs => "macos".to_string(),
            DesktopEnvironment::Gnome => "gnome".to_string(),
            DesktopEnvironment::Mate => "mate".to_string(),
            DesktopEnvironment::Xfce => "xfce".to_string(),
            DesktopEnvironment::Cinnamon => "cinnamon".to_string(),
            DesktopEnvironment::Unity => "unity".to_string(),
            DesktopEnvironment::Cosmic => "cosmic".to_string(),
            DesktopEnvironment::CosmicEpoch => "CosmicEpoch".to_string(),
            DesktopEnvironment::Lxde => "lxde".to_string(),
            DesktopEnvironment::Lxqt => "lxqt".to_string(),
            DesktopEnvironment::Enlightenment => "enlightenment".to_string(),
            DesktopEnvironment::Dde => "dde".to_string(),
            DesktopEnvironment::Hyprland => "hyprland".to_string(),
            DesktopEnvironment::Tde => "tde".to_string(),
            DesktopEnvironment::Sway => "sway".to_string(),
            DesktopEnvironment::Rox => "rox".to_string(),
            DesktopEnvironment::Razor => "razor".to_string(),
            DesktopEnvironment::Pantheon => "pantheon".to_string(),
            DesktopEnvironment::Old => "old".to_string(),
            DesktopEnvironment::Ede => "ede".to_string(),
            DesktopEnvironment::Endless => "endless".to_string(),
            _ => "unknown".to_string(),
        }
    } else {
        "unknown".to_string()
    }
}

#[tauri::command]
async fn close_splashscreen(app: tauri::AppHandle) {
    if let Some(splashscreen) = app.get_webview_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    if let Some(main) = app.get_webview_window("main") {
        main.show().unwrap();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .register_asynchronous_uri_scheme_protocol("stream", move |_ctx, request, responder| {
            tauri::async_runtime::spawn(async move {
                let response = get_stream_response(request).await.unwrap_or_else(|err| {
                    ResponseBuilder::new()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .header(header::CONTENT_TYPE, mime::TEXT_PLAIN_UTF_8.essence_str())
                        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .body(err.to_string().into_bytes())
                        .unwrap()
                });
                responder.respond(response);
            });
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(geo_spark::states::AppData::new())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            get_desktop_environment,
            update_login_state,
            convert,
            tle_generate_czml
        ])
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();
            let app_handle = app.handle().clone();
            main_window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    let state = app_handle.state::<geo_spark::states::AppData>();
                    if state.check_login() {
                        api.prevent_close();
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
