import { SceneUBO } from "../../Scene/SceneUBO";
import { FogShaders } from "./Shared/FogShader";
import { NoiseShaders } from "./Shared/NoiseShader";
import { SkyShaders } from "./Shared/SkyShader";

export class ItemShader {
  static GetVertex() {
    return /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D; 
precision highp sampler2DArray;

${
  SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine
}     
     
//texture animations
uniform sampler2DArray dve_item;
uniform usampler2D dve_item_animation; 
uniform int dve_item_animation_size;

//uniforms
uniform mat4 world;
uniform mat4 viewProjection;
uniform vec3 worldOrigin;
uniform vec3 cameraPosition;

//attributes
in vec3 position;
in vec3 normal;
in float textureIndex;
in vec2 uv;


#ifdef INSTANCES
//matricies
in vec4 world0;
in vec4 world1;
in vec4 world2;
in vec4 world3;
#endif

//varying
out vec3 vNormal;
out vec3 worldPOS;
out float vDistance;
out float vBrightness;
out vec3 vUV;

float getTextureIndex(int index) {
  uint tInt = texelFetch(dve_item_animation, 
  ivec2( index % dve_item_animation_size,  index / dve_item_animation_size), 0).r;
  if(tInt == 0u) return float(index);
  return float(index);
}


void main(void) {

    vNormal = normal;

    vec4 worldPOSTemp = world * vec4(position, 1.0);
    worldPOS = vec3(worldPOSTemp.x, worldPOSTemp.y, worldPOSTemp.z);
    vDistance = distance(cameraPosition, worldPOS);

    vBrightness = 1.0;
    if(normal.y > 0.0) {
        vBrightness += .5;
    } else if(normal.y < 0.0) {
        vBrightness -= .5;
    }


    vUV.x = uv.x;
    vUV.y = uv.y;
    vUV.z = textureIndex;

    #ifdef INSTANCES
    mat4 finalWorld = mat4(world0, world1, world2, world3);

    vDistance = distance(cameraPosition, finalWorld[3].xyz);

    finalWorld[3].xyz += worldOrigin.xyz;
    gl_Position = viewProjection * finalWorld * vec4(position, 1.0);  
    #endif      
    #ifndef INSTANCES
    vec4 worldPosition = world * vec4(position, 1.0);
    gl_Position = viewProjection * world * vec4(position, 1.0); 

    #endif

 

}


`;
  }

  static GetFragment() {
    return /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D; 
precision highp sampler2DArray;

${
  SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine
}     

//uniforms
uniform vec3 cameraPosition;
uniform sampler2DArray dve_item;
uniform usampler2D dve_item_animation; 
uniform int dve_item_animation_size;   

//varying
in vec3 vNormal;
in vec3 worldPOS;
in float vDistance;
in float vBrightness;
in vec3 vUV;
//functions

${NoiseShaders.FBMNoiseFunctions}
${FogShaders.Functions}
${SkyShaders.Functions}

out vec4 FragColor;  
void main(void) {
  
    vec4 rgb = texture(dve_item,vec3(vUV.xy,vUV.z)) * vBrightness;
    if (rgb.a < 0.1) { 
      discard;
      return;
    }

    vec3 fog = getFogColor();
    vec3 sky = getSkyColor(fog);
    vec4 skyBlendColor = blendSkyColor(sky, rgb);
    vec4 fogColor = blendFog(fog, skyBlendColor);
    FragColor = fogColor;
   // FragColor = vec4(vec3(1.) * vBrightness,1.0);
}
        `;
  }
}
