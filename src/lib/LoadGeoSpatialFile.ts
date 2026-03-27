import {
    Cesium3DTileset,
    Color,
    CzmlDataSource,
    GeoJsonDataSource,
    Resource,
    Viewer,
} from "cesium";
import {invoke} from "@tauri-apps/api/core";
import {platform} from "@tauri-apps/plugin-os";
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

export const LoadGeoJSON = async (file: string, viewer: Viewer,color:string) => {
    const baseColor = Color.fromCssColorString(color)
    try {
        const geojsonLayer = await GeoJsonPrimitiveLayer.load(`${getSchema()}${file}`,{
            stroke:baseColor,
            fill: Color.fromAlpha(baseColor,0.6),
            strokeWidth: 3,
            markerSymbol: "?",
        })
        viewer.scene.primitives.add(geojsonLayer.primitiveCollection)
        return geojsonLayer
    } catch (err:any) {
        try {
            const datasource = await GeoJsonDataSource.load(`${getSchema()}${file}`,{
                stroke: baseColor,
                fill: Color.fromAlpha(baseColor,0.6),
                strokeWidth: 3,
                markerSymbol: "?",
            })
            await viewer.dataSources.add(datasource)
            return datasource
        } catch (err:any) {
            throw  err
        }
    }
}

export const LoadTileJSON = async (file: string, viewer: Viewer) => {
    const tileset = await Cesium3DTileset.fromUrl(
       new Resource({
           url: `${getSchema()}${file}`,
       }),
       {
           progressiveResolutionHeightFraction: 0.5,  // 先加载 50% 分辨率的瓦片
           preferLeaves: false,                       // 先粗后细，避免空洞

           // 2. 动态误差控制 - 远处降低精度
           dynamicScreenSpaceError: true,
           dynamicScreenSpaceErrorDensity: 0.002,     // 更高密度 = 更远距离开始降质
           dynamicScreenSpaceErrorFactor: 16.0,       // 降低远处精度强度
           dynamicScreenSpaceErrorHeightFalloff: 0.1, // 低空时完全精细，高空允许降质

           // 3. 内存保守策略
           maximumScreenSpaceError: 32,               // 放宽误差，减少瓦片数量
           cacheBytes: 1024 * 1024 * 1024,             // 512MB -> 256MB，强制快速回收
           maximumCacheOverflowBytes: 512 * 1024 * 1024, // 限制峰值内存

           // 4. 移动时 aggressive culling
           cullRequestsWhileMoving: true,
           cullRequestsWhileMovingMultiplier: 120.0,  // 更激进的剔除，快速移动不加载

           // 5. 注视点优化（关键抗卡顿）
           foveatedScreenSpaceError: true,
           foveatedConeSize: 0.2,                     // 中心 20% 区域高清
           foveatedMinimumScreenSpaceErrorRelaxation: 4.0, // 边缘放宽 4 倍误差
           foveatedTimeDelay: 0.5,                    // 停止 0.5s 后才加载边缘，避免拖拽时卡顿

           // 6. 跳级加载（大数据集必备）
           skipLevelOfDetail: true,
           skipScreenSpaceErrorFactor: 8,             // 跳级阈值
           skipLevels: 2,                             // 一次跳 2 级，减少请求数
           baseScreenSpaceError: 512,                 // 起始跳级误差
           immediatelyLoadDesiredLevelOfDetail: false, // 允许中间层级过渡
           loadSiblings: false                        // 不加载兄弟节点，减少 30% 请求
       },
   )
    viewer.scene.primitives.add(tileset)
    return tileset
};

export const LoadCzml = async (file: string, viewer: Viewer) => {
  viewer.clock.shouldAnimate = true
  const czmlDataSource = await CzmlDataSource.load(`${getSchema()}${file}`)
  await viewer.dataSources.add(czmlDataSource)
  return czmlDataSource
};
//@ts-ignore
export const LoadShapefile = async (file: string, viewer: Viewer,color:string) => {
    try {
        await invoke("convert",{shpPath:file})
        file = changeExtension(file, "geojson")
        return  await LoadGeoJSON(file,viewer,color)
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
/**
 * 从文件路径中提取文件名（可选择是否保留扩展名）
 * @param path 完整文件路径（如 "/user/doc/test.txt"、"C:\files\demo.png"）
 * @param keepExt 是否保留扩展名（默认 true）
 * @returns 提取的文件名
 */
export function getFileNameFromPath(path: string, keepExt: boolean = true): string {
    // 第一步：统一替换路径分隔符（兼容 Windows \ 和 Linux/macOS /）
    const normalizedPath = path.replace(/\\/g, '/');
    // 第二步：分割路径，取最后一段（文件名部分）
    const fullFileName = normalizedPath.split('/').pop() || '';

    if (!keepExt) {
        // 去掉扩展名（处理多后缀如 .tar.gz 的情况，只保留第一个 . 前的部分）
        return fullFileName.split('.').slice(0, -1).join('.') || fullFileName;
    }

    return fullFileName;
}