export class VoxelShader {
  static Attributes = /* glsl */ `
in vec3 position;    
in vec3 normal;    
in uvec3 textureIndex;
in vec2 uv;           
in vec4 color;      
in uvec4 voxelData;  
    `;
    static TextureUniforms = /* glsl */`
  uniform sampler2DArray dve_voxel;
  uniform usampler2D dve_voxel_animation; 
  uniform int dve_voxel_animation_size;   
    `;
  static LightConstants = /* glsl */ `
  const uint lightMask = uint(0xf);
const uint aoMask = uint(${0b11});
const uint animMask = uint(${0b11});
const uint vertexMask = uint(${0b11});
const uint sVLIndex = 0u;
const uint rVLIndex = 4u;
const uint gVLIndex = 8u;
const uint bVLIndex = 12u;
const uint ao1Index = 16u;
const uint ao2Index = 18u;
const uint ao3Index = 20u;
const uint ao4Index = 22u;
const uint animIndex = 16u;
const uint vertexIndex = 16u;

const float lightGradient[16] = float[16](
0.0, 0.08, 0.16, 0.21, 0.27, 0.34, 0.42, 0.5, 0.59, 0.68, 0.77, 0.85, 0.91, 0.96, 0.99, 1.
);
const float aoArray[5] = float[5](1., pow( 1. - .2 , 2.2), pow( 1. - .2 * 2., 2.2), pow( 1. - .2 * 3. , 2.2), pow( 1. - .2 * 4. , 2.2)); 
const vec2 quadUVArray[4] = vec2[4](vec2(1.,1.),vec2(0.,1.),vec2(0.,0.),vec2(1.,0.));     

  `;
  static TextureConstants = /* glsl */ `
    const uint textureIndexMask = uint(0xffff);
    const uint mainTexutreIndex = uint(0);
    const uint secondaryTextureIndex = uint(0xf + 0x1);
  `;

  static LightVaryingOut = /* glsl */ `
    out vec2 iUV;
    out vec3 vLight1;
    out vec3 vLight2;
    out vec3 vLight3;
    out vec3 vLight4;
    out vec4 vAO;
    out vec4 vColors;
  `;
  static TextureVaryingOut = /* glsl */ `
    out float vFlow;
    out vec3 vUV;
    out vec4 vOverlayTextureIndex;
  `;
  static WorldVaryingOut = /* glsl */ `
    out vec3 vWorldPOS;
    out float vDistance;
    out vec3 vWorldNormal;
  `;

  static LightVaryingIn = /* glsl */ `
    in vec2 iUV;
    in vec3 vLight1;
    in vec3 vLight2;
    in vec3 vLight3;
    in vec3 vLight4;
    in vec4 vAO;
    in vec4 vColors;
  `;
  static TextureVaryingIn = /* glsl */ `
    in float vFlow;
    in vec3 vUV;
    in vec4 vOverlayTextureIndex;
  `;
  static WorldVaryingIn = /* glsl */ `
    in vec3 vWorldPOS;
    in float vDistance;
    in vec3 vWorldNormal;
  `;
  static GetTextureIndexFunction = /* glsl */ `
  float getTextureIndex(int index) {
  uint tInt = texelFetch(dve_voxel_animation, 
  ivec2( index % dve_voxel_animation_size,  index / dve_voxel_animation_size), 0).r;
  if(tInt == 0u) return float(index);
  return float(tInt);
}
  `;

  static SetLightVarying = /* glsl */ `
vLight1 =  getLightValue(uint(voxelData.x),scene_shadeOptions.y,scene_shadeOptions.x,scene_levels.y,scene_levels.x);
vLight2 =  getLightValue(uint(voxelData.y),scene_shadeOptions.y,scene_shadeOptions.x,scene_levels.y,scene_levels.x);
vLight3 =  getLightValue(uint(voxelData.z),scene_shadeOptions.y,scene_shadeOptions.x,scene_levels.y,scene_levels.x);
vLight4 =  getLightValue(uint(voxelData.w),scene_shadeOptions.y,scene_shadeOptions.x,scene_levels.y,scene_levels.x);

uint AO = uint(voxelData.x);
vAO.x = aoArray[int((AO >> ao1Index) & aoMask)];
vAO.y = aoArray[int((AO >> ao2Index) & aoMask)];
vAO.z = aoArray[int((AO >> ao3Index) & aoMask)];
vAO.w = aoArray[int((AO >> ao4Index) & aoMask)];

iUV = quadUVArray[( uint(voxelData.z) >> vertexIndex) & vertexMask];

if(scene_shadeOptions.w == 1.0) {
    vColors = vec4(1.0, 1.0, 1.0, 1.0);
} else {
    vColors = vec4(1.0, 1.0, 1.0, 1.0);
}


 
 `;

  static SetTextureVarying = /* glsl */ `

float animVL = float(( uint(voxelData.y) >> animIndex) & animMask);
vFlow = 0.;
if(animVL == 1.) {
    vFlow = -1.;
}
if(animVL == 2.) {
    vFlow = 1.;
}


vUV.x = uv.x;
vUV.y = uv.y;
vUV.z = getTextureIndex(int(textureIndex.x & textureIndexMask));
vOverlayTextureIndex.x = getTextureIndex(int((textureIndex.x >> secondaryTextureIndex) & textureIndexMask));
vOverlayTextureIndex.y = getTextureIndex(int(textureIndex.y & textureIndexMask));
vOverlayTextureIndex.z = getTextureIndex(int((textureIndex.y >> secondaryTextureIndex) & textureIndexMask));
vOverlayTextureIndex.w = getTextureIndex(int(textureIndex.z & textureIndexMask));

 `;
  static GetLightValueVertexFunction = /* glsl */ `
   vec3 getLightValue(uint value, float doRGB, float doSUN,float sunLevel,float baseLevel ) {
 return  vec3(
    max(
((
    //rgb light
    vec3(lightGradient[(value >> rVLIndex) & lightMask], lightGradient[(value >> gVLIndex) & lightMask], lightGradient[(value >> bVLIndex) & lightMask]) * doRGB ) 
    //sun light
    + (lightGradient[(value >> sVLIndex) & lightMask] * doSUN * sunLevel)), 
    //base light min
    baseLevel
)
);
}`;

  static GetLightFragFunction = /*glsl */ `
 vec3 getLight() {
  vec3 top    = mix( vLight2,    vLight1,    iUV.x);
  vec3 bottom = mix( vLight3,  vLight4, iUV.x);
  return mix(bottom, top, iUV.y);
}
 `;

  static GetAOFragFunction = /* glsl */ `
  float getAO() {
    float top    = mix( vAO.y,    vAO.x,    iUV.x);
    float bottom = mix( vAO.z,  vAO.w, iUV.x);
    return mix(bottom, top, iUV.y);
  }
 `;

  static GetOverlayTextureFrag = (
    props: {
      outColorName: string;
    } = {
      outColorName: "rgb",
    },
  ) => /* glsl */ `
if(vOverlayTextureIndex.x > 0.){
vec4 oRGB =  textureLod(dve_voxel, vec3(vUV.xy, vOverlayTextureIndex.x),0.0);
if(oRGB.a > 0.5) {
    ${props.outColorName} = oRGB;
}
}
if(vOverlayTextureIndex.y > 0.){
vec4 oRGB =  textureLod(dve_voxel, vec3(vUV.xy, vOverlayTextureIndex.y),0.0);
if(oRGB.a > 0.5) {
    ${props.outColorName} = oRGB;
}
}
if(vOverlayTextureIndex.z > 0.){
vec4 oRGB =  textureLod(dve_voxel, vec3(vUV.xy, vOverlayTextureIndex.z),0.0);
if(oRGB.a > 0.5) {
    ${props.outColorName} = oRGB;
}
}
if(vOverlayTextureIndex.w > 0.){
vec4 oRGB =  textureLod(dve_voxel, vec3(vUV.xy, vOverlayTextureIndex.w),0.0);
if(oRGB.a > 0.5) {
    ${props.outColorName} = oRGB;
}
}
`;
}
