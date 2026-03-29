import { SceneUBO } from "../../Scene/SceneUBO";
import { FogShaders } from "./Shared/FogShader";
import { NoiseShaders } from "./Shared/NoiseShader";
import { SkyShaders } from "./Shared/SkyShader";

export class SkyboxShader {
  static GetVertex() {
    return /* glsl */ `#version 300 es
precision highp float;

${
  SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine
}     

//uniforms
uniform mat4 world;
uniform mat4 viewProjection;
uniform vec3 cameraPosition;

//attributes
in vec3 position;
in vec3 normal;


//varying
out vec3 vWorldPOS;
out float vDistance;

void main(void) {
    vec4 worldPOS =  world * vec4(position, 1.0);
    vWorldPOS = worldPOS.xyz;
    vDistance = distance(cameraPosition, vWorldPOS );
    gl_Position = viewProjection * worldPOS;

} 
    `;
  }
  static GetCustomFragment(main?: string, top?: string) {
    return /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2DArray;


${
  SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine
}     

//uniforms
uniform vec3 cameraPosition;

//varying
in vec3 vWorldPOS;
in float vDistance;


//functions

${SkyShaders.Functions}
${NoiseShaders.FBMNoiseFunctions}
${FogShaders.Functions}

${top || ""}
out vec4 FragColor;  
void main(void) {

${main || ""}
} 
`;
  }
  static GetFragment() {
    return /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2DArray;


${
  SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine
}     

//uniforms
uniform vec3 cameraPosition;

//varying
in vec3 vWorldPOS;
in float vDistance;


//functions

${SkyShaders.Functions}
${NoiseShaders.FBMNoiseFunctions}
${FogShaders.Functions}

out vec4 FragColor;  
void main(void) {
  vec3 fogColor = getFogColor();
  vec4 skyColor = vec4(getSkyColor(fogColor),1.);
  FragColor = blendFog(fogColor,skyColor);

} 
    `;
  }
}
