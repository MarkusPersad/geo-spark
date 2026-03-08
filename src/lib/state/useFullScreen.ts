import {defineStore} from "pinia";
import {Ref, ref} from "vue";

export const useFullScreen = defineStore('fullscreen', ()=>{
    const fullScreen:Ref<boolean> = ref(false)
    const changeFullScreen = ()=>{
        fullScreen.value = !fullScreen.value
    }
    return {
        fullScreen,
        changeFullScreen
    }
})