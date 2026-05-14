import * as Cesium from 'cesium'
import glsl from './glsl.js'
/**
 * 可视域分析。
 *
 * @author Helsing
 * @date 2020/08/28
 * @alias Viewshed3D
 * @class
 * @param {Cesium.Viewer} viewer Cesium三维视窗。
 * @param {Object} options 选项。
 * @param {Cesium.Cartesian3} options.viewPosition 观测点位置。
 * @param {Cesium.Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
 * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
 * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
 * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
 * @param {Number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
 * @param {Number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
 * @param {Cesium.Color} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
 * @param {Cesium.Color} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
 * @param {Boolean} options.enabled 阴影贴图是否可用。
 * @param {Boolean} options.softShadows 是否启用柔和阴影。
 * @param {Boolean} options.size 每个阴影贴图的大小。
 */
class Viewshed3D {
  constructor(viewer, options) {
    this.viewer = viewer;

    // 视角参数
    this.horizontalViewAngle = options.horizontalViewAngle || 90.0;
    this.verticalViewAngle = options.verticalViewAngle || 60.0;
    this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
    this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
    this.enabled = (typeof options.enabled === "boolean") ? options.enabled : true;
    this.softShadows = (typeof options.softShadows === "boolean") ? options.softShadows : true;
    this.size = options.size || 2048;

    // 如果初始化时就传入了点，则直接开始分析
    if (options.viewPosition && options.viewPositionEnd) {
      this.updatePosition(options.viewPosition, options.viewPositionEnd);
    }
  }

  /**
   * 更新视线坐标并重新分析
   * @param {Cesium.Cartesian3} startPosition 观测点位置
   * @param {Cesium.Cartesian3} endPosition 目标点位置
   */
  updatePosition(startPosition, endPosition) {
    this.viewPosition = startPosition;
    this.viewPositionEnd = endPosition;

    if (this.viewPosition && this.viewPositionEnd) {
      this.viewDistance = Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd);
      this.viewHeading = getHeading(this.viewPosition, this.viewPositionEnd);
      this.viewPitch = getPitch(this.viewPosition, this.viewPositionEnd);

      // 重新渲染分析结果
      this.update();
    }
  }

  add() {
    this.createLightCamera();
    this.createShadowMap();
    this.createPostStage();
    this.drawFrustumOutline();
    this.drawSketch();
  }

  update() {
    this.clear();
    this.add()
  }
  // 安全清除场景中的图元和后处理，防止对象销毁报错
  clear() {
    if (this.sketch) {
      this.viewer.entities.remove(this.sketch);
      this.sketch = null;
    }
    if (this.frustumOutline) {
      if (!this.frustumOutline.isDestroyed()) {
        this.viewer.scene.primitives.remove(this.frustumOutline);
      }
      this.frustumOutline = null;
    }
    if (this.postStage) {
      this.viewer.scene.postProcessStages.remove(this.postStage);
      this.postStage = null;
    }
    if (this.shadowMap) {
      if (this.viewer.scene.shadowMap === this.shadowMap) {
        this.viewer.scene.shadowMap = undefined;
      }
      if (!this.shadowMap.isDestroyed()) {
        this.shadowMap.destroy();
      }
      this.shadowMap = null;
    }
  }

  // 创建光源相机
  createLightCamera() {
    this.lightCamera = new Cesium.Camera(this.viewer.scene);
    this.lightCamera.position = this.viewPosition;
    this.lightCamera.frustum.near = this.viewDistance * 0.001;
    this.lightCamera.frustum.far = this.viewDistance;
    const hr = Cesium.Math.toRadians(this.horizontalViewAngle);
    const vr = Cesium.Math.toRadians(this.verticalViewAngle);
    const aspectRatio = (Math.tan(hr / 2)) / (Math.tan(vr / 2));
    this.lightCamera.frustum.aspectRatio = aspectRatio;
    this.lightCamera.frustum.fov = hr > vr ? hr : vr;
    this.lightCamera.setView({
      destination: this.viewPosition,
      orientation: {
        heading: Cesium.Math.toRadians(this.viewHeading || 0),
        pitch: Cesium.Math.toRadians(this.viewPitch || 0),
        roll: 0
      }
    });
  }

  // 创建阴影贴图
  createShadowMap() {
    this.shadowMap = new Cesium.ShadowMap({
      context: (this.viewer.scene).context,
      lightCamera: this.lightCamera,
      enabled: this.enabled,
      isPointLight: true,
      pointLightRadius: this.viewDistance,
      cascadesEnabled: false,
      size: this.size,
      softShadows: this.softShadows,
      normalOffset: false,
      fromLightSource: false,
    });
    this.viewer.scene.shadowMap = this.shadowMap;

    // 启用地形阴影与深度测试（支持地形遮挡可视域分析的关键）
    this.viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
  }

  // 创建后期处理阶段(PostStage)
  createPostStage() {
    const fs = glsl
    const postStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        shadowMap_textureCube: () => {
          if (!this.shadowMap || this.shadowMap.isDestroyed()) return this.viewer.scene.context.defaultCubeTexture;
          this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
          return Reflect.get(this.shadowMap, "_shadowMapTexture");
        },
        shadowMap_matrix: () => {
          if (!this.shadowMap || this.shadowMap.isDestroyed()) return new Cesium.Matrix4();
          this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
          return Reflect.get(this.shadowMap, "_shadowMapMatrix");
        },
        shadowMap_lightPositionEC: () => {
          if (!this.shadowMap || this.shadowMap.isDestroyed()) return new Cesium.Cartesian4();
          this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
          return Reflect.get(this.shadowMap, "_lightPositionEC");
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          if (!this.shadowMap || this.shadowMap.isDestroyed()) return new Cesium.Cartesian4();
          this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
          const bias = this.shadowMap._pointBias;
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            this.shadowMap._distance,
            this.shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          );
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          if (!this.shadowMap || this.shadowMap.isDestroyed()) return new Cesium.Cartesian4();
          this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
          const bias = this.shadowMap._pointBias;
          const texelStepSize = new Cesium.Cartesian2();
          texelStepSize.x = 1.0 / this.shadowMap._textureSize.x;
          texelStepSize.y = 1.0 / this.shadowMap._textureSize.y;
          return Cesium.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cesium.Cartesian4()
          );
        },
        camera_projection_matrix: () => this.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: () => this.lightCamera.viewMatrix,
        helsing_viewDistance: () => this.viewDistance,
        helsing_visibleAreaColor: () => this.visibleAreaColor,
        helsing_invisibleAreaColor: () => this.invisibleAreaColor,
      }
    });
    this.postStage = this.viewer.scene.postProcessStages.add(postStage);
  }

  // 创建视锥外边框
  drawFrustumOutline() {
    const scratchRight = new Cesium.Cartesian3();
    const scratchRotation = new Cesium.Matrix3();
    const scratchOrientation = new Cesium.Quaternion();
    const direction = this.lightCamera.directionWC;
    const up = this.lightCamera.upWC;
    let right = this.lightCamera.rightWC;
    right = Cesium.Cartesian3.negate(right, scratchRight);

    Cesium.Matrix3.setColumn(scratchRotation, 0, right, scratchRotation);
    Cesium.Matrix3.setColumn(scratchRotation, 1, up, scratchRotation);
    Cesium.Matrix3.setColumn(scratchRotation, 2, direction, scratchRotation);
    let orientation = Cesium.Quaternion.fromRotationMatrix(scratchRotation, scratchOrientation);

    let instance = new Cesium.GeometryInstance({
      geometry: new Cesium.FrustumOutlineGeometry({
        frustum: this.lightCamera.frustum,
        origin: this.viewPosition,
        orientation: orientation
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.YELLOWGREEN),
        show: new Cesium.ShowGeometryInstanceAttribute(true)
      }
    });

    this.frustumOutline = this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    );
  }

  // 创建视网边界线 (球体切片)
  drawSketch() {
    this.sketch = this.viewer.entities.add({
      position: this.viewPosition,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        this.viewPosition,
        Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - this.horizontalViewAngle, this.viewPitch, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.Cartesian3(this.viewDistance, this.viewDistance, this.viewDistance),
        minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
        maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
        minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
        maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
        fill: false,
        outline: true,
        subdivisions: 128,
        outlineColor: Cesium.Color.YELLOWGREEN
      }
    });
  }
}

// 获取偏航角
function getHeading(fromPosition, toPosition) {
  let finalPosition = new Cesium.Cartesian3();
  let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
  Cesium.Matrix4.inverse(matrix4, matrix4);
  Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
  Cesium.Cartesian3.normalize(finalPosition, finalPosition);
  return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
}

// 获取俯仰角
function getPitch(fromPosition, toPosition) {
  let finalPosition = new Cesium.Cartesian3();
  let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
  Cesium.Matrix4.inverse(matrix4, matrix4);
  Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
  Cesium.Cartesian3.normalize(finalPosition, finalPosition);
  return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
}

export default Viewshed3D;
