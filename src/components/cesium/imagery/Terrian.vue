<script setup lang="ts">
import {inject, onMounted, onUnmounted} from "vue";
import {CesiumProvider, cesiumProviderSymbol} from "@/components/cesium";
import {createWorldTerrainAsync, EllipsoidTerrainProvider, ShadowMode, WebMercatorTilingScheme} from "cesium";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const ionTerrain = await createWorldTerrainAsync({
    requestWaterMask: true,
    requestVertexNormals: true
})
onMounted(()=>{
  if (cesiumProvider?.viewer){
    cesiumProvider.viewer.terrainProvider = ionTerrain
    cesiumProvider.viewer.terrainShadows = ShadowMode.RECEIVE_ONLY
    cesiumProvider.viewer.scene.globe.depthTestAgainstTerrain = true
  }
})
onUnmounted(()=>{
  if (cesiumProvider?.viewer){
    cesiumProvider.viewer.terrainShadows = ShadowMode.DISABLED
    cesiumProvider.viewer.scene.globe.depthTestAgainstTerrain = false
    cesiumProvider.viewer.terrainProvider = new EllipsoidTerrainProvider({
      tilingScheme: new WebMercatorTilingScheme(),
    })
  }
})
</script>

<template>

</template>
