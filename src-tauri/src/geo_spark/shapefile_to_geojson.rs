use std::path::Path;
use anyhow::anyhow;
use shp2geojson_cesium::{convert, discover};
use tauri_plugin_os::platform;

#[tauri::command]
pub async  fn convert(shp_path: String) -> tauri::Result<bool> {
    tauri::async_runtime::spawn(async move {
        let shp = Path::new(&shp_path);
        let geojson = shp.with_extension("geojson");
        let shapefile_entry = discover::check_entry(shp);
        let options = convert::ConvertOptions{
            geojsonl: false,
            overwrite: true,
            on_record: None,
            reproject_from_prj: if platform() == "android" || platform() == "ios" { None } else { shapefile_entry.prj.clone() }
        };
        if shapefile_entry.is_valid() {
            let _ = convert::convert(&shapefile_entry, geojson.as_path(), &options).map_err(|e| tauri::Error::Anyhow(anyhow!(e.to_string())));
        }
        Ok(true)
    }).await?
}
