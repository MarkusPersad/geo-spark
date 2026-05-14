
import * as Cesium from 'cesium';

/**
 * 可视域分析配置选项
 */
export interface Viewshed3DOptions {
  /** 观测点位置 (可选，可在构造后通过 updatePosition 设置) */
  viewPosition?: Cesium.Cartesian3;
  /** 目标点位置 (可选，可在构造后通过 updatePosition 设置) */
  viewPositionEnd?: Cesium.Cartesian3;
  /** 可视域水平夹角（单位：度，默认值：90） */
  horizontalViewAngle?: number;
  /** 可视域垂直夹角（单位：度，默认值：60） */
  verticalViewAngle?: number;
  /** 可视区域颜色（默认值：绿色） */
  visibleAreaColor?: Cesium.Color;
  /** 不可视区域颜色（默认值：红色） */
  invisibleAreaColor?: Cesium.Color;
  /** 阴影贴图是否可用（默认值：true） */
  enabled?: boolean;
  /** 是否启用柔和阴影（默认值：true） */
  softShadows?: boolean;
  /** 阴影贴图分辨率大小（默认值：2048） */
  size?: number;
}

/**
 * 可视域分析类 (纯渲染分析版)
 */
declare class Viewshed3D {
  /**
   * 创建一个可视域分析实例
   * @param viewer Cesium三维视窗
   * @param options 配置选项
   */
  constructor(viewer: Cesium.Viewer, options: Viewshed3DOptions);

  viewer: Cesium.Viewer;
  viewPosition: Cesium.Cartesian3 | undefined;
  viewPositionEnd: Cesium.Cartesian3 | undefined;

  viewDistance: number;
  viewHeading: number;
  viewPitch: number;

  horizontalViewAngle: number;
  verticalViewAngle: number;
  visibleAreaColor: Cesium.Color;
  invisibleAreaColor: Cesium.Color;
  enabled: boolean;
  softShadows: boolean;
  size: number;

  /** 内部渲染资源 */
  lightCamera: Cesium.Camera | null;
  shadowMap: Cesium.ShadowMap | null;
  postStage: Cesium.PostProcessStage | null;
  frustumOutline: Cesium.Primitive | null;
  sketch: Cesium.Entity | null;

  /**
   * 核心方法：更新视点与终点位置并触发重新渲染
   * @param startPosition 观测点坐标
   * @param endPosition 目标点坐标
   */
  updatePosition(startPosition: Cesium.Cartesian3, endPosition: Cesium.Cartesian3): void;

  /** 重新添加所有渲染资源 */
  add(): void;

  /** 更新分析状态（清除并重新创建） */
  update(): void;

  /** 安全地清除所有渲染资源及后处理阶段，并切断 ShadowMap 引用 */
  clear(): void;

  /** 私有或内部方法 */
  private createLightCamera(): void;
  private createShadowMap(): void;
  private createPostStage(): void;
  private drawFrustumOutline(): void;
  private drawSketch(): void;
}

export default Viewshed3D;

