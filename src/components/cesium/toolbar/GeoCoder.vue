<script setup lang="ts">
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {SearchIcon} from 'lucide-vue-next'
import {inject, Ref, ref} from "vue";
import { BaseURL,API } from '@/assets/default.json'
import {Http} from "@/lib";
import {toast} from "vue-sonner";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {Cartesian3} from "cesium";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)

const searchText:Ref<string> = ref('')

const search = async () =>{
  try {
    if (cesiumProvider?.viewer){
      let url = `${BaseURL}${API.GEOCODER}`
      let res = await Http.useFetch(url,{
        method:'POST',
        body:JSON.stringify({
          "keyword":searchText.value
        })
      })
      let response = await res.json()
      if (!res.ok || (response.code && response.code !== 0)){
        throw new Error(response.message)
      }
      if (response.status && response.status !== "0"){
        throw new Error(response.msg)
      }
      cesiumProvider.viewer.camera.flyTo({
        destination:Cartesian3.fromDegrees(parseFloat(response.location.lon as string),parseFloat(response.location.lat as string),1000)
      })
    }
  }catch (err:any) {
   toast.error(err.message||String(err))
  }
}
</script>

<template>
  <Field orientation="horizontal">
    <Input type="text" placeholder="请输入地址" v-model="searchText" />
    <Button variant="default" size="icon" @click="search">
      <SearchIcon />
    </Button>
  </Field>
</template>