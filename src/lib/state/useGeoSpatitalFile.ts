import {defineStore} from "pinia";
import {ref, Ref} from "vue";

export const useGeoSpatialFile = defineStore('geospatialFile', ()=>{
    const geospatialFile:Ref<string> = ref('')
    return {
        geospatialFile,
    }
})