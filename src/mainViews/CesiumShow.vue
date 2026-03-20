<script setup lang="ts">
import {BaseLayerSwitch, CesiumViewer, FileLoader, GeoCoder, TerrainToggle, Zoom} from "@/components/cesium";
import {FloatingButton} from "@/components/data";
import {useTemplateRef} from "vue";
import {onBeforeRouteUpdate} from "vue-router";
import {useSources} from "@/lib/state";
import {Cartesian3, CzmlDataSource, GeoJsonDataSource} from "cesium";
import GeoJsonPrimitiveLayer from "@cesium-extends/primitive-geojson";
import { bboxPolygon,center } from '@turf/turf';
import {toast} from "vue-sonner";

defineOptions({
  name: "CesiumShow"
})
const cv = useTemplateRef("cv")
const {getSource,removeSource} = useSources()

onBeforeRouteUpdate((to)=>{
  const key = to.params.key as string
  const  isDelete = to.params.delete
  if (cv.value?.cesiumProvider&& key){
    const source = getSource(key)
    if (source){
      if (!Boolean(isDelete)){
        try {
          if (source instanceof GeoJsonPrimitiveLayer){
            const centerPoint = center(bboxPolygon(source.geojson?.bbox!))
            const [lon, lat] = centerPoint.geometry.coordinates;
            cv.value.cesiumProvider.viewer?.camera.flyTo({
              destination: Cartesian3.fromDegrees(lon, lat, 100),
            })
          } else {
            cv.value.cesiumProvider.viewer?.flyTo(source)
          }
        } catch (err:any) {
          toast.error(err.message||String(err))
          cv.value.cesiumProvider.viewer?.camera.flyHome(2.0)
        }
      } else {
        if (source instanceof GeoJsonDataSource){
          cv.value.cesiumProvider.viewer?.dataSources.remove(source)
        } else if (source instanceof GeoJsonPrimitiveLayer){
          source.primitiveCollection.destroyPrimitives = true
          source.primitiveCollection.removeAll()
        } else if (source instanceof CzmlDataSource){
          cv.value.cesiumProvider.viewer?.dataSources.remove(source)
          if (cv.value.cesiumProvider.viewer){
            cv.value.cesiumProvider.viewer.clock.shouldAnimate = false
          }
        }
        removeSource(key)
      }
    }
  }
})
</script>

<template>
  <CesiumViewer ref="cv">
    <FloatingButton>
      <template v-slot:up>
        <TerrainToggle />
        <GeoCoder />
      </template>
      <template v-slot:left>
        <BaseLayerSwitch />
        <FileLoader />
      </template>
    </FloatingButton>
    <Zoom />
  </CesiumViewer>
</template>