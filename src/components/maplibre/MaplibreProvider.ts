import {FullscreenControl, Map, NavigationControl} from 'maplibre-gl'
import { InjectionKey, Ref, ShallowRef } from 'vue'

export interface MaplibreProvider {
  map: Map | null
}


export const maplibreProviderSymbol = Symbol.for('maplibre-provider') as InjectionKey<MaplibreProvider>

export const InitMap = (ref: Readonly<ShallowRef<HTMLDivElement | null>>, provider: MaplibreProvider, isReady: Ref<boolean>, center: [number, number] = [108.95, 34.55]) => {
  provider.map = new Map({
    container: ref.value!,
    center: center,
    zoom: 2,
    pitch: 0,
    bearing: 0,
  })
  provider.map.addControl(new FullscreenControl(),'top-right')
  provider.map.addControl(new NavigationControl(), 'top-right')
  isReady.value = true
}