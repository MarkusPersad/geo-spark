import {defineStore} from "pinia";
import {ref} from "vue";

export const useCapture = defineStore('capture', ()=>{
    const capture= ref<boolean>(false)
    return {capture}
})