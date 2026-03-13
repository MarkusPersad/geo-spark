import { Map, NavigationControl } from 'maplibre-gl'
import { InjectionKey, Ref, ShallowRef } from 'vue'

export interface MaplibreProvider {
  map: Map | null
}


export const maplibreProviderSymbol = Symbol.for('maplibre-provider') as InjectionKey<MaplibreProvider>

export const InitMap = (ref: Readonly<ShallowRef<HTMLDivElement | null>>, provider: MaplibreProvider, isReady: Ref<boolean>, center: [number, number] = [108.95, 34.55]) => {
  provider.map = new Map({
    container: ref.value!,
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: center,
    zoom: 2,
    pitch: 0,
    bearing: 0,
  })
  provider.map.addControl(new NavigationControl(), 'top-right')
  provider.map.on('load', () => {
    isReady.value = true
  })
}