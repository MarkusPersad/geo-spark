import { defineStore } from "pinia";
import { ref, Ref } from "vue"
interface ClockState {
  isClock: boolean
  timeRange: {
    start: Date
    end: Date
  },
  realTime: boolean
  multiplier: number
  timeRangeBorrowed: boolean
}

export const useClock = defineStore('clock', () => {
  const clockState: Ref<ClockState> = ref({
    isClock: false,
    timeRange: {
      start: new Date(),
      end: new Date()
    },
    realTime: true,
    multiplier: 1.0,
    timeRangeBorrowed: false
  })
  return { clockState }
})