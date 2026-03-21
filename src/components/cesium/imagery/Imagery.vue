<script setup lang="ts">
import {inject, onMounted, onUnmounted} from "vue";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {RequestErrorEvent, Resource, UrlTemplateImageryProvider, WebMercatorTilingScheme} from "cesium";
import {BaseURL,API} from '@/assets/default.json';
import {Http} from "@/lib";
import {toast} from "vue-sonner";

const retryCallback = async (resource:Resource|undefined,error:RequestErrorEvent|undefined) => {
  try {
    if (error?.statusCode === 401){
      if (!Http.isRefreshValid()){
        await Http.refreshToken()
      }
      if (resource)
        resource.headers = {
          ...Http.getHeaders(),
          "XHR":true
        }
    }
    return Promise.resolve(true)
  } catch (err:any) {
    toast.error(err.message || String(err))
    return Promise.reject(false)
  }
}

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const imgMap = new UrlTemplateImageryProvider({
  url: new Resource({
    url:`${BaseURL}${API.IMAGERY}/{s}/img_w/{z}/{x}/{y}`,
    headers:{
      ...Http.getHeaders(),
      "XHR":true
    },
    retryCallback,
    retryAttempts: 1,
  }),
  subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  tilingScheme: new WebMercatorTilingScheme(),
  maximumLevel: 18,
})
const iboMap = new UrlTemplateImageryProvider({
  url: new Resource({
    url:`${BaseURL}${API.IMAGERY}/{s}/ibo_w/{z}/{x}/{y}`,
    headers:{
      ...Http.getHeaders(),
      "XHR":true
    },
    retryCallback,
    retryAttempts: 1,
  }),
  subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  tilingScheme: new WebMercatorTilingScheme(),
  maximumLevel: 18
})
const ciaMap = new UrlTemplateImageryProvider({
  url:new Resource({
    url:`${BaseURL}${API.IMAGERY}/{s}/cia_w/{z}/{x}/{y}`,
    headers:{
      ...Http.getHeaders(),
      "XHR":true
    },
    retryCallback,
    retryAttempts: 1,
  }),
  subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  tilingScheme: new WebMercatorTilingScheme(),
  maximumLevel: 18
})
onMounted(() => {
  cesiumProvider?.viewer?.imageryLayers.addImageryProvider(imgMap)
  cesiumProvider?.viewer?.imageryLayers.addImageryProvider(iboMap)
  cesiumProvider?.viewer?.imageryLayers.addImageryProvider(ciaMap)
})
onUnmounted(() => {
  cesiumProvider?.viewer?.imageryLayers.removeAll()
})
</script>
<template></template>