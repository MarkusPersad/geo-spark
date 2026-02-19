use anyhow::anyhow;
use futures::{stream, StreamExt};
use geojson::{Feature, FeatureCollection};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::json;
use shapefile::{Reader, Shape};
use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tauri::async_runtime::Mutex;
use tauri::{AppHandle, Emitter};
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

#[derive(Serialize,Clone,Deserialize)]
struct ProcessPayload {
    current : u64,
    total : u64,
    percentage:f64,
    message: String,
    status: String
}

#[tauri::command]
pub async fn convert_shapefile_to_geojson(
    app_handle: AppHandle,
    window: tauri::Window,  // 获取当前窗口
    input_path: String,
    output_path: String,
)->tauri::Result<()>{
    let window_label = window.label().to_string();

    convert(app_handle,window_label,input_path,output_path).await
}
 async fn convert(app:AppHandle,window_label:String,input_path :String,output_path :String)-> tauri::Result<()>{
    let base_path = Path::new(&input_path);
    let shp_path = base_path.with_extension("shp");
    let dbf_path = base_path.with_extension("dbf");
    let mut shp_reader = Reader::from_path(shp_path.clone()).map_err(|_e|tauri::Error::Anyhow(anyhow!("Error opening shp file")))?;
    let all_count = count_records(&shp_path,&dbf_path)?;
    let features = Arc::new(Mutex::new(Vec::<Feature>::new()));
    let processed_count = Arc::new(AtomicU64::new(0));
    emit_to_window(&app,&window_label,0,all_count,"Starting conversion","processing")?;
    let shape_records:Vec<_> = shp_reader.iter_shapes_and_records().collect();
    let tasks = stream::iter(shape_records)
        .map(|shape_record|  {
            let features = Arc::clone(&features);
            let app_handle = app.clone();
            let window_label = window_label.clone();
            let processed_count = Arc::clone(&processed_count);
            let total = all_count;
            tokio::spawn(async move {
                let result = process_shape_record(shape_record, features).await;
                let current = processed_count.fetch_add(1, Ordering::SeqCst) + 1;
                if current.is_multiple_of(10) || current == total {
                    emit_to_window(
                        &app_handle,
                        &window_label,
                        current,
                        total,
                        "Processing...",
                        "processing"
                    )?;
                }
                result
            })
        }).buffer_unordered(num_cpus::get());
    let results: Vec<_> = tasks.collect().await;
    for result in results {
        match result {
            Ok(Ok(())) => {},
            Ok(Err(err)) =>{
                return Err(err)
            },
            Err(_err) => {
                return Err(tauri::Error::Anyhow(anyhow!("Error processing shape record")));
            }
        }
    }
    let feature_collection = FeatureCollection {
        bbox: None,
        features: features.lock().await.clone(),
        foreign_members: None,
    };
    let geojson_string = serde_json::to_string_pretty(&feature_collection).map_err(|_e|tauri::Error::Anyhow(anyhow!("Error serializing geojson")))?;
    let mut file = File::create(&output_path).await?;
    file.write_all(geojson_string.as_bytes()).await?;
    emit_to_window(&app,&window_label,all_count,all_count,"Conversion complete","complete")?;
    Ok(())
}

fn count_records(
    shp_path:&Path,
    dbf_path:&Path
) -> tauri::Result<u64>{
    let mut shp_reader = Reader::from_path(shp_path).map_err(|_e|tauri::Error::Anyhow(anyhow!("Error opening shp file")))?;
    let mut dbf_reader = dbase::Reader::from_path(dbf_path).map_err(|_e|tauri::Error::Anyhow(anyhow!("Error opening dbf file")))?;
    let shp_count = shp_reader.iter_shapes_and_records().count();
    let dbf_count = dbf_reader.iter_records().count();
    if shp_count != dbf_count {
        Err(tauri::Error::Anyhow(anyhow!("Shp and Dbf record counts do not match")))
    } else {
        Ok(shp_count as u64)
    }
}

async fn process_shape_record(
    shape_record: Result<(Shape, dbase::Record), shapefile::Error>,
    features: Arc<Mutex<Vec<Feature>>>,
) -> tauri::Result<()>{
    let (shape, record) = shape_record.map_err(|_e|tauri::Error::Anyhow(anyhow!("Error reading shape record")))?;
    let geojson_string = match shape {
        Shape::Polygon(_) => super::shape_to_geojson::process_polygon(&shape)?,
        Shape::Polyline(_) => super::shape_to_geojson::process_polyline(&shape)?,
        Shape::Point(_) => super::shape_to_geojson::process_point(&shape)?,
        Shape::PolygonZ(_) => super::shape_to_geojson::process_polygon_z(&shape)?,
        _ => Err(tauri::Error::Anyhow(anyhow!("Unsupported shape type")))?,
    };
    let mut feature: Feature = serde_json::from_str(&geojson_string)?;

    if let Some(props) = &mut feature.properties {
        let re_numeric = Regex::new(r"Numeric\(Some\(([0-9]+(\.[0-9]+)?)\)\)").unwrap();
        let re_character = Regex::new(r#"^Character\(Some\("(.+)"\)\)"#).unwrap();

        for (field, value) in record.into_iter() {
            let value_string = value.to_string();
            let value_json = match value_string.as_str() {
                "Numeric(None)" => json!(""),
                "Character(None)" => json!(null),
                _ => {
                    if let Some(caps) = re_numeric.captures(&value_string) {
                        let number_str = caps.get(1).map_or("", |m| m.as_str());
                        if let Ok(number) = number_str.parse::<f64>() {
                            json!(number)
                        } else {
                            eprintln!("Failed to parse numeric value: {}", value_string);
                            json!(value_string)
                        }
                    } else if let Some(caps) = re_character.captures(&value_string) {
                        let character_str = caps.get(1).map_or("", |m| m.as_str());
                        json!(character_str)
                    } else {
                        json!(value_string)
                    }
                }
            };
            props.insert(field.to_string(), value_json);
        }
    }

    features.lock().await.push(feature);
    Ok(())
}

fn emit_to_window(
    app:&AppHandle,
    window_label: &str,
    current: u64,
    total: u64,
    message: &str,
    status: &str
)-> tauri::Result<()>{
  let percentage = if total > 0 {
      (current as f64 / total as f64) * 100.0
  } else { 0.0 };
    if let Err(err) = app.emit_to(window_label,"shapefile-convert-progress",ProcessPayload{
        current,
        total,
        percentage,
        message: message.to_string(),
        status: status.to_string()
    }) {
        Err(tauri::Error::Anyhow(anyhow!("Error emitting to window: {}",err)))
    } else {
        Ok(())
    }
}