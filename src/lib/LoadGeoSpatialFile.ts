import {Color, GeoJsonDataSource, Viewer} from "cesium";
import {convertFileSrc} from "@tauri-apps/api/core";

export const LoadGeoJSON = async (file:string,viewer:Viewer) =>{
    viewer.dataSources.removeAll()
    await viewer.dataSources.add(GeoJsonDataSource.load(convertFileSrc(file),{
        stroke:Color.HOTPINK,
        fill:Color.PINK,
        strokeWidth:3,
        markerSymbol:'?'
    }))
}