import { PBRShaderUpdateData } from "Shaders/Shader.types";
import { VoxelShader } from "./Shared/VoxelShader";
import { NoiseShaders } from "./Shared/NoiseShader";

export class VoxelPBRShader {
  static GetLiquidVertexUpdates({ name }: { name: string }) {
    const vertexUpdates = this.GetVertexUpdates({ name });

    return {
      ...vertexUpdates,
      CUSTOM_VERTEX_UPDATE_NORMAL: /*glsl*/ `
  ${vertexUpdates.CUSTOM_VERTEX_UPDATE_NORMAL}
  #ifdef  DVE_${name}
  vec3 noisePOS = vec3(worldPOS.x/100., worldPOS.y, worldPOS.z/100.);
  
  float amp   = 0.1;
  float eps   = 0.01;
  float freq  = ${1.0 / 3.0};    
  vec3  flow  = vec3(time * 0.01, 0.0, time * 0.005);
  
  float h  = fbm3(noisePOS + flow);
  float hx = fbm3(noisePOS + vec3(eps, 0.0, 0.0) + flow);
  float hz = fbm3(noisePOS + vec3(0.0, 0.0, eps) + flow);
  
  float dhdx = amp * freq * (hx - h) / eps;
  float dhdz = amp * freq * (hz - h) / eps;
  
  normalUpdated     = normalize(vec3(-dhdx, 1.0, -dhdz));
  positionUpdated.y += amp * h;
  
  #endif
`,
    };
  }
  static GetVertexUpdates({
    name,
  }: {
    name: string;
    doAO?: boolean;
  }): PBRShaderUpdateData {
    return {
      CUSTOM_VERTEX_BEGIN: VoxelShader.Attributes,

      CUSTOM_VERTEX_DEFINITIONS: /*glsl*/ `
            #ifdef  DVE_${name}
            precision highp float;
            precision highp int;
            precision highp usampler2D; 
            precision highp sampler2DArray;
            ${VoxelShader.TextureUniforms}
            ${VoxelShader.LightConstants}
            ${VoxelShader.TextureConstants}
            ${VoxelShader.LightVaryingOut}
            ${VoxelShader.TextureVaryingOut}
            ${VoxelShader.WorldVaryingOut}
            ${VoxelShader.GetLightValueVertexFunction}
            ${VoxelShader.GetTextureIndexFunction}
            ${NoiseShaders.FBMNoiseFunctions}
            
            #endif
            `,

      CUSTOM_VERTEX_UPDATE_NORMAL: /*glsl*/ `
            #ifdef  DVE_${name}
                #ifdef INSTANCES
                  mat4 finalWorld = mat4(world0, world1, world2, world3);
                  //finalWorld[3].xyz += worldOrigin.xyz;
                  vec4 worldPOS = finalWorld * vec4(position, 1.0);
                  vWorldPOS = worldPOS.xyz;
                  vWorldNormal = normalize(mat3(finalWorld) * normal);
                 // vDistance = distance(cameraPosition.xyz, vWorldPOS.xyz);
                #endif      
                #ifndef INSTANCES
                  vec4 worldPOS = world * vec4(position, 1.0);
                 // worldPOS.xyz += worldOrigin.xyz;
                  vWorldPOS = worldPOS.xyz;
                  vWorldNormal = normalize(mat3(world) * normal);
                 // vDistance = distance(cameraPosition.xyz, vWorldPOS.xyz);
                #endif
            
                         
            #endif
            
            `,
      CUSTOM_VERTEX_MAIN_BEGIN: /*glsl*/ `
            #ifdef  DVE_${name}
            vLight1 =  getLightValue(uint(voxelData.x),1.0,0.0,0.0,0.1);
            vLight2 =  getLightValue(uint(voxelData.y),1.0,0.0,0.0,0.1);
            vLight3 =  getLightValue(uint(voxelData.z),1.0,0.0,0.0,0.1);
            vLight4 =  getLightValue(uint(voxelData.w),1.0,0.0,0.0,0.1);
            
            
     
            uint AO = uint(voxelData.x);
            vAO.x = aoArray[int((AO >> ao1Index) & aoMask)];
            vAO.y = aoArray[int((AO >> ao2Index) & aoMask)];
            vAO.z = aoArray[int((AO >> ao3Index) & aoMask)];
            vAO.w = aoArray[int((AO >> ao4Index) & aoMask)];
            
            iUV = quadUVArray[( uint(voxelData.z) >> vertexIndex) & vertexMask];
            
            
            vColors = vec4(1.0, 1.0, 1.0, 1.0);
            
            ${VoxelShader.SetTextureVarying}
            #endif
                    `,
    };
  }
  static GetFragmentUpdates({
    name,
    doAO,
  }: {
    name: string;
    doAO?: boolean;
  }): PBRShaderUpdateData {
    return {
      CUSTOM_FRAGMENT_DEFINITIONS: /*glsl*/ `
#ifdef  DVE_${name}
precision highp float;
precision highp int;
precision highp usampler2D; 
precision highp sampler2DArray;
${VoxelShader.TextureUniforms}
${VoxelShader.LightVaryingIn}
${VoxelShader.TextureVaryingIn}
${VoxelShader.WorldVaryingIn}
${VoxelShader.GetLightFragFunction}
${VoxelShader.GetAOFragFunction}
#endif
`,

      CUSTOM_FRAGMENT_UPDATE_ALBEDO: /*glsl*/ `
#ifdef  DVE_${name}
vec4 voxelBaseColor = texture(dve_voxel,vec3(vUV.xy,vUV.z));    
${VoxelShader.GetOverlayTextureFrag({ outColorName: "voxelBaseColor" })}
voxelBaseColor = toLinearSpace(voxelBaseColor);
${doAO === undefined || doAO ? "voxelBaseColor.rgb *= getAO();" : ""}
//voxelBaseColor = vec4(1.0);
//vec4 voxelMixLight = vec4(vec3(VOXEL[2].rgb + 1.).xyz,1.) * voxelBaseColor;
surfaceAlbedo = vec3(voxelBaseColor.r,voxelBaseColor.g,voxelBaseColor.b);
alpha = voxelBaseColor.a;
#endif
`,
      "!vec3\\s+finalAmbient\\s*=\\s*vAmbientColor\\s*;": /*glsl*/ `
            vec3 voxelLight = getLight(); 
            vec3 finalAmbient = vAmbientColor + voxelLight.rgb * 2.0;
        `,
      CUSTOM_FRAGMENT_MAIN_END: /*glsl*/ `
#ifdef  DVE_${name}
if (glFragColor.a < 0.05) {
  discard;
}
#endif
`,
    };
  }
}
