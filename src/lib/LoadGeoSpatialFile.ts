import {
  Cesium3DTileset,
  Color,
  CzmlDataSource,
  GeoJsonDataSource,
  Resource,
  Viewer,
} from "cesium";
import { convertFileSrc } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";

const osPlatform = platform();

const getSchema = () => {
  switch (osPlatform) {
    case "windows":
    case "android":
      return "http://stream.localhost/";
    default:
      return "stream://localhost/";
  }
};

export const LoadGeoJSON = async (file: string, viewer: Viewer) => {
  const dataSource = await GeoJsonDataSource.load(convertFileSrc(file), {
    stroke: Color.HOTPINK,
    fill: Color.PINK,
    strokeWidth: 3,
    markerSymbol: "?",
  });
  await viewer.dataSources.add(dataSource);
  await viewer.zoomTo(dataSource);
};

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
  viewer.dataSources.add(czmlDataSource)
  await viewer.zoomTo(czmlDataSource)
};