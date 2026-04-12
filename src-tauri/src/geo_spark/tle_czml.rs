use chrono::{Datelike, Utc};
use satkit::{ITRFCoord, Instant, TLE, frametransform, sgp4::sgp4_full};
use std::fs::File;
use std::io::BufWriter;
use std::path::PathBuf;
use struson::writer::{JsonStreamWriter, JsonWriter};

fn tle_to_itrfs(tle0: String, tle1: String, tle2: String) -> tauri::Result<Vec<ITRFCoord>> {
    let mut tle = TLE::load_3line(&tle0, &tle1, &tle2)
        .map_err(|_err| tauri::Error::Anyhow(anyhow::anyhow!("TLE解析错误")))?;
    let today = Utc::now();
    let tm = Instant::from_datetime(
        today.year(),
        today.month() as i32,
        today.day() as i32,
        0,
        0,
        0.0,
    )
    .map_err(|_err| tauri::Error::Anyhow(anyhow::anyhow!("日期获取错误")))?
    .as_jd_utc();
    let itrfs: Vec<ITRFCoord> = (0..=48)
        .map(|index| {
            let time = Instant::from_jd_utc(tm + 30.0 * 60.0 * index as f64);
            let states = sgp4_full(
                &mut tle,
                &[time],
                satkit::sgp4::GravConst::WGS84,
                satkit::sgp4::OpsMode::IMPROVED,
            )
            .unwrap();
            let pos = numeris::vector![states.pos[(0, 0)], states.pos[(1, 0)], states.pos[(2, 0)]];
            let p_itrf = frametransform::qteme2itrf(&time) * pos;
            ITRFCoord::from_slice(p_itrf.as_slice()).unwrap()
        })
        .collect();
    Ok(itrfs)
}

#[tauri::command]
pub async fn tle_generate_czml(
    model: String,
    tle0: String,
    tle1: String,
    tle2: String,
) -> tauri::Result<()> {
    tauri::async_runtime::spawn(async move {
        let mut czml_path = PathBuf::from(&model);
        czml_path.set_extension("czml");
        let mut writer = BufWriter::new(File::create(czml_path)?);
        let mut json_writer = JsonStreamWriter::new(&mut writer);
        json_writer.begin_object()?;
        json_writer.begin_array()?;
        // 插入各个packet
        json_writer.end_array()?;
        json_writer.end_object()?;
        json_writer.finish_document()?;
        Ok(())
    })
    .await?
}

