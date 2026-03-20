import {defineStore} from "pinia";
import {computed, markRaw, ref, Ref} from "vue";

export const useSources = defineStore('sources', ()=>{
    const sources:Map<string, any> = markRaw(new Map())
    const updateCount:Ref<number> = ref(0)
    const addSource = (id:string, source:any)=>{
      sources.set(id, source)
        updateCount.value++
    }
    const removeSource = (id:string)=>{
        sources.delete(id)
        updateCount.value++
    }
    const getSource = (id:string)=>{
        return sources.get(id)
    }
    const clearSources = ()=>{
        sources.clear()
        updateCount.value++
    }
    const sourceList = computed(()=>{
        updateCount.value
        return Array.from(sources.values())
    })
    const getKeys = computed(()=>{
        updateCount.value
        return Array.from(sources.keys())
    })
    return {
        addSource,
        removeSource,
        getSource,
        clearSources,
        sourceList,
        getKeys
    }
})