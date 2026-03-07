<script setup lang="ts">
import {CesiumViewer, Imagery,Terrain,Zoom} from "@/components/cesium";
defineOptions({
  name: "CesiumShow"
})

</script>

<template>
  <CesiumViewer>
    <Zoom />
    <Imagery />
    <suspense>
      <Terrain />
    </suspense>
  </CesiumViewer>
</template>