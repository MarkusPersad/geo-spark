export default `
#version 300 es
#define USE_CUBE_MAP_SHADOW true

precision highp float;

// 基础纹理输入
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;

// 输入变量 (WebGL 2 使用 in 代替 varying)
in vec2 v_textureCoordinates;

// 矩阵与阴影相关 Uniforms
uniform mat4 camera_projection_matrix;
uniform mat4 camera_view_matrix;
uniform samplerCube shadowMap_textureCube;
uniform mat4 shadowMap_matrix;
uniform vec4 shadowMap_lightPositionEC;
uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;

// 业务参数
uniform float helsing_viewDistance; 
uniform vec4 helsing_visibleAreaColor;
uniform vec4 helsing_invisibleAreaColor;

// 输出变量
out vec4 fragColor;

struct zx_shadowParameters {
    vec3 texCoords;
    float depthBias;
    float depth;
    float nDotL;
    vec2 texelStepSize;
    float normalShadingSmooth;
    float darkness;
};

// 计算阴影可见度
float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters) {
    float depthBias = shadowParameters.depthBias;
    float depth = shadowParameters.depth;
    float nDotL = shadowParameters.nDotL;
    float normalShadingSmooth = shadowParameters.normalShadingSmooth;
    float darkness = shadowParameters.darkness;
    vec3 uvw = shadowParameters.texCoords;
    depth -= depthBias;
    // 使用 Cesium 内置深度对比函数
    float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
}

vec4 getPositionEC(){
    return czm_windowToEyeCoordinates(gl_FragCoord);
}

vec3 getNormalEC(){
    return vec3(1.);
}

// 转换到相机坐标系
vec4 toEye(in vec2 uv, in float depth){
    vec2 xy = vec2((uv.x * 2. - 1.), (uv.y * 2. - 1.));
    vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.);
    posInCamera = posInCamera / posInCamera.w;
    return posInCamera;
}

// 获取标准化深度值
float getDepth(in vec4 depthData){
    float z_window = czm_unpackDepth(depthData);
    // 处理反向对数深度，对地形支持至关重要
    z_window = czm_reverseLogDepth(z_window); 
    float n_range = czm_depthRange.near;
    float f_range = czm_depthRange.far;
    return (2. * z_window - n_range - f_range) / (f_range - n_range);
}

// 核心阴影计算函数
float shadow(in vec4 positionEC){
    vec3 normalEC = getNormalEC();
    zx_shadowParameters shadowParameters;
    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
    
    // 修复拼写：确保变量名与 uniform 声明一致
    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; 
    
    vec3 directionEC = positionEC.xyz - shadowMap_lightPositionEC.xyz;
    float distance = length(directionEC);
    directionEC = normalize(directionEC);
    float radius = shadowMap_lightPositionEC.w;
    
    // 超出观测距离直接返回可见
    if(distance > radius) return 2.0;
    
    vec3 directionWC = czm_inverseViewRotation * directionEC;
    
    // --- 消除条纹的关键修正 ---
    // 增加偏移量 (Bias) 以减少 Z-fighting
    shadowParameters.depth = distance / radius - 0.001; 
    
    shadowParameters.nDotL = clamp(dot(normalEC, -directionEC), 0., 1.);
    shadowParameters.texCoords = directionWC;
    
    return czm_shadowVisibility(shadowMap_textureCube, shadowParameters);
}

// 判断点是否在视锥体内
bool visible(in vec4 result) {
    result.x /= result.w;
    result.y /= result.w;
    result.z /= result.w;
    return result.x >= -1. && result.x <= 1.
        && result.y >= -1. && result.y <= 1.
        && result.z >= -1. && result.z <= 1.;
}

void main(){
    // 采样原始颜色 (WebGL 2 使用 texture 代替 texture2D)
    fragColor = texture(colorTexture, v_textureCoordinates);
    
    // 获取场景深度
    float depth = getDepth(texture(depthTexture, v_textureCoordinates));
    
    // 还原坐标
    vec4 viewPos = toEye(v_textureCoordinates, depth);
    vec4 wordPos = czm_inverseView * viewPos;
    vec4 vcPos = camera_view_matrix * wordPos;
    
    float near = .001 * helsing_viewDistance;
    float dis = length(vcPos.xyz);
    
    // 仅在观测距离范围内进行分析
    if(dis > near && dis < helsing_viewDistance){
        vec4 posInEye = camera_projection_matrix * vcPos;
        
        if(visible(posInEye)){
            float vis = shadow(viewPos);
            
            // 混合可视区与不可视区颜色
            if(vis > 0.3){
                fragColor = mix(fragColor, helsing_visibleAreaColor, 0.5);
            } else {
                fragColor = mix(fragColor, helsing_invisibleAreaColor, 0.5);
            }
        }
    }
}
`
