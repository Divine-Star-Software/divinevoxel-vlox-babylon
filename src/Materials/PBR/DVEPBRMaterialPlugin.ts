import type { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { UniformBuffer } from "@babylonjs/core/Materials/uniformBuffer";
import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";
import { DVEBRPBRMaterial } from "./DVEBRPBRMaterial";
import { VoxelShader } from "../../Shaders/Code/Shared/VoxelShader";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { NoiseShaders } from "../../Shaders/Code/Shared/NoiseShader";
import { PBRShaderData, ShaderStoreData } from "../../Shaders/Shader.types";
import { DVEBRShaderStore } from "../../Shaders/DVEBRShaderStore";

export class DVEPBRMaterialPlugin extends MaterialPluginBase {
  uniformBuffer: UniformBuffer;
  shaderData: ShaderStoreData;
  dveMaterial: DVEBRPBRMaterial;
  textures: BaseTexture[];
  constructor(material: PBRMaterial, name: string) {
    super(material, name, 20, {
      [`DVE_${name}`]: false,
    });

    this._enable(true);

    material.customShaderNameResolve = (
      shaderName,
      uniforms,
      uniformBuffers,
      samplers,
      defines,
      attributeList,
      options,
    ) => {
      options!.processFinalCode = (shaderType: string, code: string) => {
        if (shaderType === "vertex") {
          code = code.replace(
            `#define CUSTOM_VERTEX_BEGIN
in vec3 position;
in vec3 normal;
in vec4 color;`,
            "",
          );
        }
        return code;
      };
      return shaderName;
    };
  }

  hasTexture(texture: BaseTexture): boolean {
    return true;
  }

  getActiveTextures(activeTextures: BaseTexture[]) {
    activeTextures.push(...this.textures);
    console.log("active textures", [...activeTextures]);
    return activeTextures;
  }
  getSamplers(samplers: string[]) {
    console.log("get samples", this, this.shaderData);
    samplers.push(...this.shaderData.samplers);
    console.log([...samplers]);
  }

  prepareDefines(defines: any) {
    defines[`DVE_${this.name}`] = true;
  }

  getClassName() {
    return "DVEPBRMaterialPlugin";
  }

  getAttributes(
    _attributes: string[],
    _scene: Scene,
    _mesh: AbstractMesh,
  ): void {
    _attributes.length = 0;
    _attributes.push(...this.shaderData.attributes);
  }

  getUniformBuffersNames(_ubos: string[]): void {}
  getUniforms() {
    return {
      ubo: [{ name: "time", type: "float", size: 1 }],
      vertex: `uniform float time;`,
      fragment: `uniform float time;`,
    };
  }

  bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine) {
    if (!this.uniformBuffer) {
      this.uniformBuffer = uniformBuffer;
    }
  }

  getCustomCode(shaderType: string) {
    const shaderData = DVEBRShaderStore.getShaderData(this.name);
    if (!shaderData?.pbr) {
      throw new Error(`${this.name} material does not have PBR data`);
    }

    if (shaderType === "vertex") {
      return shaderData.pbr!.vertexUpdates;
    }
    if (shaderType === "fragment") {
      return shaderData.pbr!.fragmentUpdates;
    }
    return null;
  }
}
