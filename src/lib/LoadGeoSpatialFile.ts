import {
    Cesium3DTileset, Color,
    CzmlDataSource, GeoJsonDataSource,
    Resource,
    Viewer,
} from "cesium";
import {invoke} from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import GeoJsonPrimitiveLayer from "@cesium-extends/primitive-geojson";

const osPlatform = platform();

export const getSchema = () => {
  switch (osPlatform) {
    case "windows":
    case "android":
      return "http://stream.localhost/";
    default:
      return "stream://localhost/";
  }
};

export const LoadGeoJSON = async (file: string, viewer: Viewer) => {
    try {
        const geojsonLayer = await GeoJsonPrimitiveLayer.load(`${getSchema()}${file}`,{
            stroke: Color.HOTPINK,
            fill: Color.PINK,
            strokeWidth: 3,
            markerSymbol: "?",
        })
        viewer.scene.primitives.add(geojsonLayer.primitiveCollection)
    } catch (err:any) {
        try {
            const datasource = await GeoJsonDataSource.load(`${getSchema()}${file}`,{
                stroke: Color.HOTPINK,
                fill: Color.PINK,
                strokeWidth: 3,
                markerSymbol: "?",
            })
            viewer.dataSources.add(datasource)
        } catch (err:any) {
            throw  err
        }
    }
}

export const LoadTileJSON = async (file: string, viewer: Viewer) => {
  const tileset = viewer.scene.primitives.add(
    await Cesium3DTileset.fromUrl(
      new Resource({
        url: `${getSchema()}${file}`,
      }),
      {
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 2.0e-4,
        dynamicScreenSpaceErrorFactor: 24.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25,
      },
    ),
  );
  await viewer.zoomTo(tileset);
};

export const LoadCzml = async (file: string, viewer: Viewer) => {
  viewer.clock.shouldAnimate = true
  const czmlDataSource = await CzmlDataSource.load(`${getSchema()}${file}`)
  await viewer.dataSources.add(czmlDataSource)
  await viewer.zoomTo(czmlDataSource)
};
//@ts-ignore
export const LoadShapefile = async (file: string, viewer: Viewer) => {
    try {
        console.log(file)
        await invoke("convert",{shpPath:file})
        file = changeExtension(file, "geojson")
        console.log(file)
        await LoadGeoJSON(file,viewer)
    } catch (err:any) {
        throw  err
    }
}

function changeExtension(filePath: string, newExt: string): string {
    // 移除开头的点号（如果用户传了 ".js" 而不是 "js"）
    const ext = newExt.startsWith('.') ? newExt.slice(1) : newExt;

    // 找到最后一个点号的位置
    const lastDotIndex = filePath.lastIndexOf('.');

    // 处理特殊情况：没有扩展名、以点开头的隐藏文件、或只有扩展名（如 ".gitignore"）
    if (lastDotIndex === -1 || lastDotIndex === 0 || filePath.lastIndexOf('/') > lastDotIndex) {
        return `${filePath}.${ext}`;
    }

    return filePath.slice(0, lastDotIndex) + '.' + ext;
}