<script setup lang="ts">
import {BaseLayerSwitch, CesiumViewer, GeoCoder, TerrainToggle, Zoom} from "@/components/cesium";
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
        <BaseLayerSwitch />
      </template>
    </FloatingButton>
    <Zoom />
  </CesiumViewer>
</template>