<script setup lang="ts">
import {
  BaseLayerSwitch,
  CesiumViewer,
  FileLoader,
  GeoCoder,
  TerrainToggle,
  Zoom,
  Popup,
  SunClock,
  Location, Export,
  Measure
} from "@/components/cesium";
import { FloatingButton } from "@/components/data";
import { useTemplateRef, watch } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useCapture, useClock, useSources } from "@/lib/state";
import { Cartesian3, Cesium3DTileset, CzmlDataSource, GeoJsonDataSource } from "cesium";
import GeoJsonPrimitiveLayer from "@cesium-extends/primitive-geojson";
import { bboxPolygon, center } from '@turf/turf';
import { toast } from "vue-sonner";
import { storeToRefs } from "pinia";

defineOptions({
  name: "CesiumShow"
})
const cv = useTemplateRef("cv")
const { getSource, removeSource } = useSources()
const { sourceList } = storeToRefs(useSources())
const { clockState } = storeToRefs(useClock())
const { capture } = storeToRefs(useCapture())

onBeforeRouteUpdate((to) => {
  const key = to.params.key as string
  const isDelete = to.params.delete
  if (cv.value?.cesiumProvider && key) {
    const source = getSource(key)
    if (source) {
      if (!Boolean(isDelete)) {
        try {
          if (source instanceof GeoJsonPrimitiveLayer) {
            const centerPoint = center(bboxPolygon(source.geojson?.bbox!))
            const [lon, lat] = centerPoint.geometry.coordinates;
            cv.value.cesiumProvider.viewer?.camera.flyTo({
              destination: Cartesian3.fromDegrees(lon, lat, 100),
            })
          } else {
            cv.value.cesiumProvider.viewer?.flyTo(source)
          }
        } catch (err: any) {
          toast.error(err.message || String(err))
          cv.value.cesiumProvider.viewer?.camera.flyHome(2.0)
        }
      } else {
        if (source instanceof GeoJsonDataSource) {
          cv.value.cesiumProvider.viewer?.dataSources.remove(source)
        } else if (source instanceof GeoJsonPrimitiveLayer) {
          source.destroy()
        } else if (source instanceof CzmlDataSource) {
          cv.value.cesiumProvider.viewer?.dataSources.remove(source)
          cv.value!.cesiumProvider.viewer &&
            (cv.value!.cesiumProvider.viewer.clock.shouldAnimate =
              sourceList.value.some(item => item instanceof CzmlDataSource))
        } else if (source instanceof Cesium3DTileset) {
          cv.value.cesiumProvider.viewer?.scene.primitives.remove(source)
        }
        removeSource(key)
      }
    }
  }
})

watch(() => sourceList.value, (value) => {
  if (value.some(source => source instanceof CzmlDataSource)) {
    clockState.value.timeRangeBorrowed = true
  } else {
    clockState.value.timeRangeBorrowed = false
    clockState.value.realTime = true
  }
})
</script>

<template>
  <CesiumViewer ref="cv">
    <FloatingButton v-show="!capture">
      <template v-slot:up>
        <Export />
        <Location />
        <Suspense>
          <TerrainToggle />
        </Suspense>
        <GeoCoder />
      </template>
      <template v-slot:left>
        <BaseLayerSwitch />
        <FileLoader />
        <SunClock />
        <Measure />
      </template>
    </FloatingButton>
    <Zoom v-show="!capture" />
    <Popup v-if="sourceList.length > 0" />
  </CesiumViewer>
</template>
