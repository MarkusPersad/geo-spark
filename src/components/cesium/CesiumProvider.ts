import {Ellipsoid, Globe, SceneMode, ShadowMode, Viewer} from "cesium";
import {InjectionKey, Ref, ShallowRef} from "vue";

export interface CesiumProvider {
    viewer:Viewer|null
}

export const cesiumProviderSymbol = Symbol.for('CesiumProvider') as InjectionKey<CesiumProvider>

export const InitViewer = (ref:Readonly<ShallowRef<HTMLDivElement|null>>,provider:CesiumProvider,isReady:Ref<boolean>) => {
    if (ref.value){
        provider.viewer = new Viewer(ref.value!,{
            animation: false,
            homeButton: false,
            fullscreenButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            geocoder: false,
            timeline: false,
            infoBox: false,
            navigationHelpButton: false,
            vrButton: false,
            scene3DOnly: true,
            sceneMode: SceneMode.SCENE3D,
            requestRenderMode: true,
            msaaSamples: 4,
            useBrowserRecommendedResolution: true,
            orderIndependentTranslucency: false,
            skyBox: false,
            skyAtmosphere: false,
            targetFrameRate: 60,
            globe: new Globe(Ellipsoid.WGS84),
            terrainShadows: ShadowMode.RECEIVE_ONLY,
            contextOptions: {
                webgl: {
                    alpha: true,
                    antialias: true,
                    depth: true,
                    stencil: false,
                    premultipliedAlpha: true,
                    preserveDrawingBuffer: false,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: false
                },
            },
            blurActiveElementOnCanvasFocus: true
        })
        provider.viewer.creditDisplay.container.style.display = 'none'
        provider.viewer.scene.globe.maximumScreenSpaceError = 24
        provider.viewer.scene.globe.tileCacheSize = 1000
        isReady.value = true
    }
}