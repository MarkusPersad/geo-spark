<script setup lang="ts">
import {CesiumViewer, GeoCoder, Imagery, TerrainToggle, Zoom} from "@/components/cesium";
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
    </FloatingButton>
    <Zoom />
    <Imagery />
  </CesiumViewer>
</template>