import { FogShaders } from "./Shared/FogShader";
import { NoiseShaders } from "./Shared/NoiseShader";
import { SceneUBO } from "../../Scene/SceneUBO";
import { SkyShaders } from "./Shared/SkyShader";
import { VoxelShader } from "./Shared/VoxelShader";

export class VoxelBaseShader {
  static GetVertex(props: {
    doAO: boolean;
    top?: string;
    uniforms?: string;
    attributes?: string;
    instanceAttributes?: string;
    functions?: string;
    varying?: string;
    inMainBefore?: string;
    inMainAfter?: string;
  }) {
    return /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D; 
precision highp sampler2DArray;
${props.top || ""}

${VoxelShader.LightConstants}
${VoxelShader.TextureConstants}

//textures
${VoxelShader.TextureUniforms}


//uniforms
${SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine}     

uniform mat4 world;
uniform mat4 view;
uniform mat4 viewProjection;
uniform vec3 worldOrigin;
uniform vec3 cameraPosition;

${props.uniforms || ""}

//attributes
${VoxelShader.Attributes}
${props.attributes || ""}

#ifdef INSTANCES
//matricies
in vec4 world0;
in vec4 world1;
in vec4 world2;
in vec4 world3;
//custom attributes
${props.instanceAttributes || ""}
#endif

//varying
${VoxelShader.LightVaryingOut}
${VoxelShader.WorldVaryingOut}
${VoxelShader.TextureVaryingOut}

${props.varying || ""}

${VoxelShader.GetTextureIndexFunction}
${VoxelShader.GetLightValueVertexFunction}

${NoiseShaders.FBMNoiseFunctions}

${props.functions || ""}

  void main(void) {

${props.inMainBefore || ""}

${VoxelShader.SetLightVarying}
${VoxelShader.SetTextureVarying}

    #ifdef INSTANCES
      mat4 finalWorld = mat4(world0, world1, world2, world3);
      finalWorld[3].xyz += worldOrigin.xyz;
      vec4 worldPOS = finalWorld * vec4(position, 1.0);
      vWorldPOS = worldPOS.xyz;
      vWorldNormal = normalize(mat3(finalWorld) * normal);
      vDistance = distance(cameraPosition, vWorldPOS);
      gl_Position = viewProjection * worldPOS;
    #endif      
    #ifndef INSTANCES
      vec4 worldPOS = world * vec4(position, 1.0);
      worldPOS.xyz += worldOrigin.xyz;
      vWorldPOS = worldPOS.xyz;
      vWorldNormal = normalize(mat3(world) * normal);
      vDistance = distance(cameraPosition, vWorldPOS);
      gl_Position = viewProjection * worldPOS;
    #endif

${props.inMainAfter || ""}


}
`;
  }
  static DefaultLiquidFragmentMain = () => /* glsl */ `
  
  vec4 rgb = texture(dve_voxel,vec3(vec2(vUV.x,vUV.y + scene_time * .01 * -1. * vFlow),vUV.z));
     ${VoxelShader.GetOverlayTextureFrag()}

  if (rgb.a < 0.1) { 
    discard;
    return;
  }



  //mix color
  rgb *= vColors;

  rgb.rgb *=  getLight();
  vec3 fog = getFogColor();
  vec3 sky = getSkyColor(fog);
  vec4 skyBlendColor = blendSkyColor(sky,rgb);
  vec4 fogColor = blendFog(fog,skyBlendColor);
  FragColor = fogColor;


  `;

  static DefaultFragmentMain = (options?: {
    doAO?: boolean;
    beforeColorOut?: string;
  }) => /* glsl */ `
    if(vDistance > scene_skyShadeOptions.y) {
        discard;
      return;
    }

      vec4 rgb = texture(dve_voxel,vec3(vUV.xy,vUV.z));    
      ${VoxelShader.GetOverlayTextureFrag()}
${
  !options || options.doAO == undefined || options.doAO
    ? /*glsl */ `
    if(scene_shadeOptions.z == 1.) {
      rgb.rgb *= getAO();
    }
`
    : ``
}



  //mix color
  rgb *= vColors;
  //mix light
  rgb.rgb *=  getLight();
  vec3 fog = getFogColor();
  vec3 sky = getSkyColor(fog);
  vec4 skyBlendColor = blendSkyColor(sky, rgb);
  vec4 finalColor = blendFog(fog, skyBlendColor);
  ${options?.beforeColorOut ? options?.beforeColorOut : ""}
 if (finalColor.a < 0.1) { 
    discard;
    return;
  }
  FragColor = finalColor;


  `;

  static GetFragment(props: {
    top?: string;
    main: string;
    uniforms?: string;
    functions?: string;
    varying?: string;
    textures?: string;
    inMainBefore?: string;
    inMainAfter?: string;
  }) {
    const shader = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D; 
precision highp sampler2DArray;
${props.top || ""}

//uniforms
${SceneUBO.UniformBufferSuppourted ? SceneUBO.Define : SceneUBO.BaseDefine}     
${VoxelShader.TextureUniforms}
uniform vec3 cameraPosition;

${props.textures ? props.textures : ""}

${props.uniforms || ""}
//varying
${VoxelShader.LightVaryingIn}
${VoxelShader.WorldVaryingIn}
${VoxelShader.TextureVaryingIn}

${props.varying || ""}
//functions

${NoiseShaders.FBMNoiseFunctions}
${FogShaders.Functions}
${SkyShaders.Functions}

${props.functions || ""}

${VoxelShader.GetLightFragFunction}

${VoxelShader.GetAOFragFunction}



out vec4 FragColor;  
void main(void) {
${props.inMainBefore || ""}
  ${props.main}
  ${props.inMainAfter || ""}
}


`;
    return shader;
  }
}
