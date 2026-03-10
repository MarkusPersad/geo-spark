<script setup lang="ts">
import {BaseLayerSwitch, CesiumViewer, FileLoader, GeoCoder, TerrainToggle, Zoom} from "@/components/cesium";
import {FloatingButton} from "@/components/data";
defineOptions({
  name: "CesiumShow"
})

</script>

<template>
  <CesiumViewer>
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