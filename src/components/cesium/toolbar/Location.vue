<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {LocateFixedIcon} from 'lucide-vue-next';
import {getClientIP, Http} from "@/lib";
import {BaseURL,API} from '@/assets/default.json';
import {inject} from "vue";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {Cartesian3} from "cesium";
import {toast} from "vue-sonner";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const viewer = cesiumProvider?.viewer!

const locate = async () =>{
  try {
    const ip = (await getClientIP()) as string
    const url = `${BaseURL}${API.IPINFO}/${ip}`
    const res = await Http.useFetch(url,{
      method: 'GET'
    })
    const response = await res.json()
    const position : [number,number] = [
      Number.parseFloat((response.data.loc as string).split(',')[1]),
      Number.parseFloat((response.data.loc as string).split(',')[0])
    ]
    viewer.camera.flyTo({
      destination:Cartesian3.fromDegrees(...position,1000)
    })
  } catch (err: any){
    toast.error(err.message || String(err))
  }
}
</script>

<template>
  <Button variant="outline" size="icon" @click="locate">
    <LocateFixedIcon />
  </Button>
</template>