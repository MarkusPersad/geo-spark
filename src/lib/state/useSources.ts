import {defineStore} from "pinia";
import {computed, ref, Ref} from "vue";

export const useSources = defineStore('sources', ()=>{
    const sources:Ref<Map<string, any>> = ref(new Map())
    const addSource = (id:string, source:any)=>{
        sources.value.set(id, source)
    }
    const removeSource = (id:string)=>{
        sources.value.delete(id)
    }
    const getSource = (id:string)=>{
        return sources.value.get(id)
    }
    const clearSources = ()=>{
        sources.value.clear()
    }
    const sourceList = computed(()=>{
        return Array.from(sources.value.values())
    })
    return {
        sources,
        addSource,
        removeSource,
        getSource,
        clearSources,
        sourceList
    }
})