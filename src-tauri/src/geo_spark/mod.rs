use public_ip_address::lookup::LookupProvider;

pub mod shapefile_to_geojson;
pub mod states;
pub mod stream_file;
pub mod tle_czml;

#[tauri::command]
pub async fn get_client_ip() -> tauri::Result<String> {
   let result = public_ip_address::perform_lookup_with(vec![
       (LookupProvider::IpWhoIs, None),
       (LookupProvider::MyIp, None),
       (LookupProvider::FreeIpApi, None),
   ],None).await.map_err(|_err|tauri::Error::Anyhow(anyhow::anyhow!("Error getting public ip address")))?;
    Ok(result.ip.to_string())
}
