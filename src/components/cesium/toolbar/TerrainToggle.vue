<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { CesiumProvider, cesiumProviderSymbol } from "@/components/cesium";
import {
  createOsmBuildingsAsync,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  ShadowMode,
  WebMercatorTilingScheme
} from "cesium";
import { Button } from "@/components/ui/button";
import { MountainIcon, MountainSnowIcon } from 'lucide-vue-next'

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const osmBuilding = await createOsmBuildingsAsync()
cesiumProvider?.viewer?.scene.primitives.add(osmBuilding)

const TerrainLoaded = ref(false)


watch(() => TerrainLoaded.value, (value) => {
  osmBuilding.show = value
}, { immediate: true })

const ToggleTerrain = async () => {
  if (cesiumProvider?.viewer) {
    if (TerrainLoaded.value) {
      cesiumProvider.viewer.terrainShadows = ShadowMode.DISABLED
      cesiumProvider.viewer.scene.globe.depthTestAgainstTerrain = false
      cesiumProvider.viewer.terrainProvider = new EllipsoidTerrainProvider({
        tilingScheme: new WebMercatorTilingScheme(),
      })
    } else {
      cesiumProvider.viewer.terrainProvider = await createWorldTerrainAsync({
        requestWaterMask: true,
        requestVertexNormals: true
      })
      cesiumProvider.viewer.terrainShadows = ShadowMode.RECEIVE_ONLY
      cesiumProvider.viewer.scene.globe.depthTestAgainstTerrain = true
    }
    TerrainLoaded.value = !TerrainLoaded.value
  }
}
</script>

<template>
  <Button size="icon" variant="outline" @click="ToggleTerrain">
    <MountainIcon v-if="!TerrainLoaded" />
    <MountainSnowIcon v-else />
  </Button>
</template>
