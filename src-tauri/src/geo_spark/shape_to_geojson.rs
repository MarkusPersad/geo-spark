use anyhow::anyhow;
use serde_json::json;
use shapefile::{PolygonRing, Shape};

/// 将Shape对象转换为GeoJSON格式的字符串
///
/// 该函数专门处理多边形形状，将其转换为符合GeoJSON标准的Feature对象字符串。
///
/// # 参数
/// * `shape` - 要处理的Shape引用，必须是Polygon类型
///
/// # 返回值
/// * `Ok(String)` - 成功时返回GeoJSON格式的字符串
/// * `Err(tauri::Error)` - 失败时返回错误，可能的原因包括：
///   - 输入不是Polygon类型
///   - JSON序列化失败
pub fn process_polygon(shape:&Shape)->tauri::Result<String>{
    // 验证输入是否为多边形类型
    let polygon = match shape {
        Shape::Polygon(p) => p,
        _ => return Err(tauri::Error::Anyhow(anyhow::anyhow!("Not a polygon"))),
    };

    // 提取多边形的所有环（外环和内环），并转换为坐标数组格式
    let rings: Vec<Vec<Vec<f64>>> = polygon
        .rings()
        .iter()
        .map(|ring| match ring {
            PolygonRing::Outer(points) | PolygonRing::Inner(points) => {
                points.iter().map(|point| vec![point.x, point.y]).collect()
            }
        })
        .collect();

    // 构造GeoJSON Feature对象
    let feature = json!({
      "type": "Feature",
      "geometry": {
          "type": "Polygon",
          "coordinates": rings
      },
      "properties": {}
  });

    // 序列化为JSON字符串并返回结果
    serde_json::to_string(&feature).map_err(|_e| tauri::Error::Anyhow(anyhow!("Error serializing JSON")))
}

/// 将带有Z坐标的Shape对象转换为GeoJSON格式的字符串
///
/// 该函数处理PolygonZ类型的形状，支持三维坐标转换，并能正确处理单个多边形
/// 或多个多边形（MultiPolygon）的情况。
///
/// # 参数
/// * `shape` - 要处理的Shape引用，必须是PolygonZ类型
///
/// # 返回值
/// * `Ok(String)` - 成功时返回GeoJSON格式的字符串
/// * `Err(tauri::Error)` - 失败时返回错误，可能的原因包括：
///   - 输入不是PolygonZ类型
///   - JSON序列化失败
pub fn process_polygon_z(shape: &Shape) -> tauri::Result<String> {
    let polygon_z = match shape {
        Shape::PolygonZ(pz) => pz,
        _ => return Err(tauri::Error::Anyhow(anyhow!("Not a polygon"))),
    };

    // PolygonZ 的 rings() 返回所有环（每个 part 的第一个 ring 是外环，后续是内环/洞）
    // 但 GeoJSON 的 MultiPolygon 结构是：[[[外环1], [内环1], [内环2]], [[外环2], ...]]
    let mut polygons: Vec<Vec<Vec<Vec<f64>>>> = Vec::new();
    let mut current_rings: Vec<Vec<Vec<f64>>> = Vec::new();

    for ring in polygon_z.rings() {
        let coords: Vec<Vec<f64>> = match ring {
            PolygonRing::Outer(points) | PolygonRing::Inner(points) => {
                points.iter().map(|p| vec![p.x, p.y, p.z]).collect()
            }
        };

        // 如果是外环（Outer），说明开始一个新多边形
        // 把之前的 polygon 保存（如果有的话）
        if matches!(ring, PolygonRing::Outer(_)) && !current_rings.is_empty() {
            polygons.push(std::mem::take(&mut current_rings));
        }

        current_rings.push(coords);
    }

    // 添加最后一个 polygon
    if !current_rings.is_empty() {
        polygons.push(current_rings);
    }

    // 决定几何类型：单个多边形还是 MultiPolygon
    let (geom_type, coordinates) = if polygons.len() == 1 {
        ("Polygon", json!(polygons.into_iter().next().unwrap()))
    } else {
        ("MultiPolygon", json!(polygons))
    };

    let feature = json!({
        "type": "Feature",
        "geometry": {
            "type": geom_type,
            "coordinates": coordinates
        },
        "properties": {}
    });

    serde_json::to_string(&feature).map_err(|_e|tauri::Error::Anyhow(anyhow!("Error serializing JSON")))
}
pub fn process_polyline(shape: &Shape) -> tauri::Result<String> {
    let polyline = match shape {
        Shape::Polyline(p) => p,
        _ => return Err(tauri::Error::Anyhow(anyhow!("Not a polyline"))),
    };

    let parts: Vec<Vec<Vec<f64>>> = polyline
        .parts()
        .iter()
        .map(|part| part.iter().map(|point| vec![point.x, point.y]).collect())
        .collect();

    let feature = json!({
      "type": "Feature",
      "geometry": {
          "type": "MultiLineString",
          "coordinates": parts
      },
      "properties": {}
  });

    serde_json::to_string(&feature).map_err(|_e| tauri::Error::Anyhow(anyhow!("Error serializing JSON")))
}

pub fn process_point(shape: &Shape) -> tauri::Result<String> {
    let point = match shape {
        Shape::Point(p) => p,
        _ => return Err(tauri::Error::Anyhow(anyhow!("Not a point"))),
    };

    let feature = json!({
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [point.x, point.y]
      },
      "properties": {}
  });

    serde_json::to_string(&feature).map_err(|_e| tauri::Error::Anyhow(anyhow!("Error serializing JSON")))
}
