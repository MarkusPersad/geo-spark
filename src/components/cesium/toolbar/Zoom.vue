<script setup lang="ts">

import {inject} from "vue";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import { MinusIcon, PlusIcon,ExpandIcon,ShrinkIcon } from 'lucide-vue-next'
import {Separator} from "@/components/ui/separator";
import {Fullscreen} from "cesium";
import {useFullScreen} from "@/lib/state";
import {storeToRefs} from "pinia";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)

const fullScreenUse = useFullScreen()

const { fullScreen } = storeToRefs(fullScreenUse)


const zoomIn = () => {
  if (cesiumProvider?.viewer){
    cesiumProvider.viewer.camera.zoomIn(cesiumProvider.viewer.camera.positionCartographic.height*0.2)
  }
}
const zoomOut = () => {
  if (cesiumProvider?.viewer){
    cesiumProvider.viewer.camera.zoomOut(cesiumProvider.viewer.camera.positionCartographic.height*0.2)
  }
}
const toggleFullScreen = () => {
  if (cesiumProvider?.viewer){
    if (!Fullscreen.fullscreen){
      Fullscreen.requestFullscreen(document.body)
    } else {
      Fullscreen.exitFullscreen()
    }
    fullScreenUse.changeFullScreen()
  }
}

</script>

<template>
  <ButtonGroup
      orientation="vertical"
      aria-label="Zoom"
      class="h-fit absolute right-2 top-2 z-10"
  >
    <Button variant="outline" size="icon" @click="toggleFullScreen">
      <ExpandIcon v-if="!fullScreen" />
      <ShrinkIcon v-else />
    </Button>
    <Separator/>
    <Button variant="outline" size="icon" @click="zoomIn">
      <PlusIcon />
    </Button>
    <Button variant="outline" size="icon" @click="zoomOut">
      <MinusIcon />
    </Button>
  </ButtonGroup>
</template>