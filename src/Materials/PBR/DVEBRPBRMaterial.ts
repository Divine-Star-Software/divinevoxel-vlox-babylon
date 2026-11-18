import { Material } from "@babylonjs/core/Materials/material";
import { PBRBaseMaterial } from "@babylonjs/core/Materials/PBR/pbrBaseMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/";
import { DVEPBRMaterialPlugin } from "./DVEPBRMaterialPlugin";
import { IMatrixLike } from "@babylonjs/core/Maths/math.like";
import { MaterialInterface } from "../MaterialInterface.js";
import { SceneOptions } from "../../Scene/SceneOptions";
import { TextureManager } from "@divinevoxel/vlox/Textures/TextureManager";
import { BaseTexture, StandardMaterial, UniformBuffer } from "@babylonjs/core";
import { DVEBRShaderStore } from "../../Shaders/DVEBRShaderStore";
import { MaterialData } from "../DVEBRMaterial.types";

export type DVEBRPBRMaterialData = MaterialData<{
  textureTypeId: string;
  effectId: string;

  material?: PBRBaseMaterial;
  plugin?: DVEPBRMaterialPlugin;
  textures?: Map<string, Texture>;
}>;

export class DVEBRPBRMaterial implements MaterialInterface {
  static ready = false;
  _material: PBRMaterial;
  scene: Scene;

  plugin: DVEPBRMaterialPlugin;

  afterCreate: ((material: PBRMaterial) => void)[] = [];

  texturesArray: BaseTexture[] = [];
  constructor(
    public options: SceneOptions,
    public id: string,
    public data: DVEBRPBRMaterialData,
  ) {}

  createMaterial(scene: Scene) {
    this.scene = scene;
    this._create(this.data);
    return this;
  }

  _create(data: DVEBRPBRMaterialData): PBRMaterial {
    const shaderData = DVEBRShaderStore.getShaderData(this.data.data.effectId);
    if (!shaderData) {
      throw new Error(
        `Could not find shader data for ${this.data.data.effectId}`,
      );
    }
    if (!shaderData.pbr) {
      console.error(`Could not find pbr data for ${data.data.effectId}`);
      this._material = new StandardMaterial("", data.scene) as any;
      return this._material;
    }
    this.scene = data.scene;
    let texture;
    let animationTexture;
    if (data.data.textureTypeId) {
      texture = TextureManager.getTexture(
        data.data.textureTypeId ? data.data.textureTypeId : this.id,
      );

      if (!texture && data.data.textureTypeId) {
        throw new Error(
          `Could find the texture type for material ${this.id}. Texture typeid:  ${data.data.textureTypeId}`,
        );
      }
      animationTexture = texture.animatedTexture;
    }
    const material = new PBRMaterial(this.id, data.scene, true);
    let time = 0;
    const animationSizeId = `${texture!.id}_animation_size`;
    material.onBind = () => {
      const effect = this._material.getEffect();
      for (const [id, texture] of this.textures) {
        effect.setTexture(id, texture);
      }
      effect.setInt(animationSizeId, animationTexture!._size);
    };

    this.setTexture(texture!.id, texture?.shaderTexture);
    this.setTexture(
      `${texture!.id}_animation`,
      animationTexture?.shaderTexture,
    );

    this.scene.registerBeforeRender(() => {
      this.setNumber("time", time);
      time += 0.1;
    });

    const pluginBase = DVEPBRMaterialPlugin;
    const newPlugin = new Function(
      "extendedClass",
      /* js */ `
      return class ${this.id} extends extendedClass {
        getClassName() {
          return ${this.id};
        }
      };
    `,
    )(pluginBase);
    const plugin = new newPlugin(material, this.id);
    plugin.shaderData = shaderData;
    plugin.dveMaterial = this;
    plugin.name = this.id;
    plugin.textures = this.texturesArray;
    this.plugin = plugin;
    this._material = material;

    if (data.alphaTesting) {
      material.alphaMode = Material.MATERIAL_ALPHATEST;
    }

    if (data.alphaBlending) {
      material.alphaMode = Material.MATERIAL_ALPHABLEND;
    }

    if (data.alpha !== undefined) {
      material.alpha = data.alpha;
    }

    if (data.forceDepthWrite !== undefined) {
      material.forceDepthWrite = data.forceDepthWrite;
    }

    if (data.backFaceCulling !== undefined) {
      material.backFaceCulling = data.backFaceCulling;
    }

    if (data.separateCullingPass !== undefined) {
      material.separateCullingPass = data.separateCullingPass;
    }

    if (data.pbr?.roughness !== undefined) {
      material.roughness = data.pbr.roughness;
    }

    if (data.pbr?.metallic !== undefined) {
      material.metallic = data.pbr.metallic;
    }

    if (data.pbr?.reflectionColor !== undefined) {
      material.reflectionColor.set(...data.pbr.reflectionColor);
    }

    if (data.pbr?.reflectivityColor !== undefined) {
      material.reflectivityColor.set(...data.pbr.reflectivityColor);
    }

    material.anisotropy.dispose();

    return this._material;
  }

  setTextureArray(samplerId: string, sampler: Texture[]): void {
    throw new Error(`Function not implemented`);
  }
  textures = new Map<string, Texture>();
  setTexture(samplerId: string, sampler: Texture): void {
    this.textures.set(samplerId, sampler);
    this.texturesArray.push(sampler);
    if (!this.plugin?.uniformBuffer) return;
    this.plugin.uniformBuffer.setTexture(samplerId, sampler);
  }
  clone(scene: Scene) {
    for (const [textId, texture] of this.textures) {
      this.plugin.uniformBuffer.setTexture(textId, null);
    }
    const pluginId = `${this.id.replace("#", "")}`;

    const pluginBase = DVEPBRMaterialPlugin;
    const newPlugin = new Function(
      "extendedClass",
      /* js */ `
      return class ${pluginId} extends extendedClass {
        getClassName() {
          return ${pluginId};
        }
      };
    `,
    )(pluginBase);
    const newMat = PBRMaterial.Parse(
      this._material.serialize(),
      scene,
      "/",
    )! as PBRMaterial;
    const plugin = new newPlugin(
      newMat,
      pluginId,
      this,
      () => {},
    ) as DVEPBRMaterialPlugin;

    const textures = new Map<string, Texture>();
    for (const [textId, texture] of this.textures) {
      const newTexture = texture.clone();
      textures.set(textId, newTexture);
      plugin.uniformBuffer.setTexture(textId, newTexture);
      this.plugin.uniformBuffer.setTexture(textId, texture!);
    }

    const mat = new DVEBRPBRMaterial(this.options, this.id, {
      ...this.data,
      data: {
        ...this.data.data,
        material: newMat,
        plugin,
        textures,
      },
    });
    mat.plugin = plugin;
    mat._material = newMat;
    mat.textures = textures;
    return mat;
  }

  setNumber(uniform: string, value: number): void {
    if (!this.plugin?.uniformBuffer) return;
    this.plugin.uniformBuffer.updateFloat(uniform, value);
  }
  setNumberArray(uniform: string, value: ArrayLike<number>): void {
    if (!this.plugin?.uniformBuffer)
      return console.warn(`Material is not ready ${uniform}`);
    this.plugin.uniformBuffer.updateArray(uniform, value as any);
  }
  setVector2(uniform: string, x: number, y: number): void {
    throw new Error(`Function not implemented`);
  }
  setVector3(uniform: string, x: number, y: number, z: number): void {
    if (!this.plugin?.uniformBuffer) return;
    this.plugin.uniformBuffer.updateVector3(uniform, new Vector3(x, y, z));
  }
  setVector4(
    uniform: string,
    x: number,
    y: number,
    z: number,
    w: number,
  ): void {
    if (!this.plugin?.uniformBuffer) return;
    this.plugin.uniformBuffer.updateVector3(uniform, new Vector4(x, y, z, w));
  }
  setMatrix<MatrixType = IMatrixLike>(
    uniform: string,
    matrix: MatrixType,
  ): void {
    if (!this.plugin?.uniformBuffer) return;
    this.plugin.uniformBuffer.updateMatrix(uniform, matrix as IMatrixLike);
  }

  syncUBO(): void {}
}
