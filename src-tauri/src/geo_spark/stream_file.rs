use http_range::HttpRange;
use std::io::SeekFrom;
use std::io::Write;
use std::path::PathBuf;
use tauri::http::{self, StatusCode, header, response::Builder as ResponseBuilder};

use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

pub async fn get_stream_response(
    request: http::Request<Vec<u8>>,
) -> Result<http::Response<Vec<u8>>, Box<dyn std::error::Error>> {
    let mut  path = percent_encoding::percent_decode(&request.uri().path().as_bytes()[1..])
            .decode_utf8_lossy()
            .to_string();
    if !path.contains(":") && !path.starts_with("/") {
        path = format!("/{}", path)
    }
    let file_path = PathBuf::from(path);
    if tokio::fs::metadata(&file_path).await.is_err() {
        return Ok(ResponseBuilder::new()
            .status(StatusCode::NOT_FOUND)
            .body(Vec::new())?);
    }
    let mut file = File::open(&file_path).await?;
    let len = {
        let old_pos = file.stream_position().await?;
        let len = file.seek(SeekFrom::End(0)).await?;
        file.seek(SeekFrom::Start(old_pos)).await?;
        len
    };
    let mut resp = ResponseBuilder::new()
        .header(
            header::CONTENT_TYPE,
            mime::APPLICATION_OCTET_STREAM.essence_str(),
        )
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "*");
    if request.method() == http::Method::OPTIONS {
        return Ok(resp
            .status(StatusCode::NO_CONTENT)
            .header(header::ACCESS_CONTROL_MAX_AGE, "86400")
            .body(Vec::new())?);
    }
    let http_response = if let Some(range_header) = request.headers().get("range") {
        let not_satisfiable = || {
            ResponseBuilder::new()
                .status(StatusCode::RANGE_NOT_SATISFIABLE)
                .header(header::CONTENT_RANGE, format!("bytes */{len}"))
                .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(vec![])
        };
        let ranges = match HttpRange::parse(range_header.to_str()?, len) {
            Ok(r) => r
                .iter()
                .map(|r| (r.start, r.start + r.length - 1))
                .collect::<Vec<_>>(),
            Err(_) => return Ok(not_satisfiable()?),
        };
        const MAX_LEN: u64 = 4 * 1024 * 1024;
        if ranges.len() == 1 {
            let &(start, mut end) = ranges.first().unwrap();
            if start >= len || end >= len || end < start {
                return Ok(not_satisfiable()?);
            }
            end = start + (end - start).min(len - start).min(MAX_LEN - 1);
            let bytes_to_read = end + 1 - start;
            let mut buf = Vec::with_capacity(bytes_to_read as usize);
            file.seek(SeekFrom::Start(start)).await?;
            file.take(bytes_to_read).read_to_end(&mut buf).await?;
            resp = resp
                .header(header::CONTENT_RANGE, format!("bytes {start}-{end}/{len}"))
                .header(header::CONTENT_LENGTH, bytes_to_read)
                .status(StatusCode::PARTIAL_CONTENT);
            resp.body(buf)
        } else {
            let mut buf = Vec::new();
            let boundary = "tokio-stream-boundary";
            resp = resp.header(
                header::CONTENT_TYPE,
                format!("multipart/byteranges; boundary={boundary}"),
            );
            for &(start, mut end) in &ranges {
                if start >= len || end >= len || end < start {
                    continue;
                }
                end = start + (end - start).min(len - start).min(MAX_LEN - 1);
                let bytes_to_read = end + 1 - start;

                // 写入边界符和响应头
                writeln!(buf, "--{boundary}")?;
                writeln!(buf, "{}:application/octet-stream", header::CONTENT_TYPE)?;
                writeln!(buf, "Content-Range: bytes {start}-{end}/{len}")?;
                writeln!(buf)?;

                // 异步读取当前 range 的内容
                let mut local_buf = vec![0u8; bytes_to_read as usize];
                file.seek(SeekFrom::Start(start)).await?;
                file.read_exact(&mut local_buf).await?;

                // 写入数据到响应缓冲区
                buf.extend(&local_buf);
                writeln!(buf)?;
            }
            writeln!(buf, "--{boundary}--")?;
            resp.body(buf)
        }
    } else {
        resp = resp.header(header::CONTENT_LENGTH, len);
        let mut buf = Vec::with_capacity(len as usize);
        file.read_to_end(&mut buf).await?;
        resp.body(buf)
    };
    http_response.map_err(Into::into)
}
