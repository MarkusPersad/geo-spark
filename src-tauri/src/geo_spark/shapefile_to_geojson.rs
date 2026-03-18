use std::path::Path;
use anyhow::anyhow;
use shp2geojson_cesium::{convert, discover};
use tauri_plugin_os::platform;

#[tauri::command]
pub fn convert(shp_path:String) ->tauri::Result<bool>{
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
       convert::convert(&shapefile_entry, geojson.as_path(), &options).map_err(|e| tauri::Error::Anyhow(anyhow!(e.to_string())))?;
    }
    Ok(true)
}