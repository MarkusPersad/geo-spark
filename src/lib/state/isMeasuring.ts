import { defineStore } from "pinia";
import { ref } from "vue";

export const isMeasuring = defineStore("isMeasuring", () => {
  const isMeasure = ref<boolean>(false)
  return {
    isMeasure
  }
})
