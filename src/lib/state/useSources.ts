import {defineStore} from "pinia";
import {ref, Ref} from "vue";

interface Sources {
    files:string []
}

export const useSources = defineStore('sources', ()=>{
    const sources:Ref<Sources> = ref({
        files:[]
    })
    return {
        sources
    }
})