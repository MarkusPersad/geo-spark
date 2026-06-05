use std::io::Cursor;

use anyhow::anyhow;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::{ImageReader, codecs::webp::WebPEncoder};
use public_ip_address::lookup::LookupProvider;

pub mod shapefile_to_geojson;
pub mod states;
pub mod stream_file;

#[tauri::command]
pub async fn get_client_ip() -> tauri::Result<String> {
    let result = public_ip_address::perform_lookup_with(
        vec![
            (LookupProvider::IpWhoIs, None),
            (LookupProvider::MyIp, None),
            (LookupProvider::FreeIpApi, None),
        ],
        None,
    )
    .await
    .map_err(|_err| tauri::Error::Anyhow(anyhow::anyhow!("Error getting public ip address")))?;
    Ok(result.ip.to_string())
}

#[tauri::command]
pub async  fn get_avatar_base64(file:String) -> tauri::Result<String> {
    let input =  tokio::fs::read(&file).await.map_err(tauri::Error::from)?;
    let base64_result = tauri::async_runtime::spawn_blocking(move || -> tauri::Result<String>{
        let img = ImageReader::new(Cursor::new(&input))
            .with_guessed_format()
            .map_err(|_|tauri::Error::Anyhow(anyhow::anyhow!("无法识别图片")))?
            .decode()
            .map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("图片解码失败")))?;
        let mut buffer: Vec<_> = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        let encoder = WebPEncoder::new_lossless(&mut cursor);
        img.write_with_encoder(encoder).map_err(|_| tauri::Error::Anyhow(anyhow::anyhow!("无损压缩失败")))?;
        let base64_str = STANDARD.encode(&buffer);
        let data_url = format!("data:image/webp;base64,{}", base64_str);
        Ok(data_url)
    }).await.map_err(|_| tauri::Error::Anyhow(anyhow!("线程同步失败")))??;
    Ok(base64_result)
}

