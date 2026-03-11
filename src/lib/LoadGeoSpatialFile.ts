import {Cesium3DTileset, Color, GeoJsonDataSource, Resource, Viewer} from "cesium";
import {convertFileSrc,invoke} from "@tauri-apps/api/core";


export const LoadGeoJSON = async (file:string,viewer:Viewer) =>{
    viewer.dataSources.removeAll()
    const dataSource = await GeoJsonDataSource.load(convertFileSrc(file),{
        stroke:Color.HOTPINK,
        fill:Color.PINK,
        strokeWidth:3,
        markerSymbol:'?'
    })
    await viewer.dataSources.add(dataSource)
    await viewer.zoomTo(dataSource)
}

export const LoadTileJSON =async (file:string,viewer:Viewer) => {
  viewer.scene.primitives.removeAll()
    await invoke("update_tileset_base_path_state",{value:getDirectoryPath(file) })
  const tileset = viewer.scene.primitives.add(await Cesium3DTileset.fromUrl(new Resource({
    url: convertFileSrc(file, "stream"),
  }), {
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 2.0e-4,
        dynamicScreenSpaceErrorFactor: 24.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25
    }))
    await viewer.zoomTo(tileset)
}

function getDirectoryPath(filePath: string): string {
    // 统一处理正反斜杠，找到最后一个分隔符
    const normalized = filePath.replace(/\\/g, '/');
    const lastSlash = normalized.lastIndexOf('/');

    // 没找到分隔符，说明只有文件名，返回空或当前目录
    if (lastSlash === -1) {
        return '.';  // 或返回 ''，根据需求
    }

    // 根目录特殊情况处理
    if (lastSlash === 0) {
        return '/';
    }

    return normalized.substring(0, lastSlash);
}