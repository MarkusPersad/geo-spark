<script setup lang="ts">
import {onMounted, onUnmounted, provide, Ref, ref, useTemplateRef} from "vue";
import {type CesiumProvider, cesiumProviderSymbol,InitViewer} from "@/components/cesium";
import {toast} from "vue-sonner";


const isReady: Ref<boolean> = ref(false)

const viewerContainer = useTemplateRef("viewer")

const cesiumProvider:CesiumProvider = {viewer:null}
provide<CesiumProvider>(cesiumProviderSymbol, cesiumProvider)

onMounted(() => {
  try {
    InitViewer(viewerContainer,cesiumProvider,isReady)
  } catch (err:any) {
    toast.error(err.message || String(err))
  }
})
onUnmounted(() => {
  if (cesiumProvider){
    cesiumProvider.viewer?.destroy()
  }
})
defineExpose({
  cesiumProvider:cesiumProvider,
})

</script>
<template>
  <div ref="viewer" class="min-w-full min-h-full relative">
    <slot v-if="isReady" />
  </div>
</template>