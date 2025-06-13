import { Material } from "@babylonjs/core/Materials/material";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/";
import { DVEPBRMaterialPlugin } from "./DVEPBRMaterialPlugin";
export class DVEBRPBRMaterial {
    options;
    id;
    data;
    static ready = false;
    _material;
    scene;
    plugin;
    afterCreate = [];
    constructor(options, id, data) {
        this.options = options;
        this.id = id;
        this.data = data;
    }
    createMaterial(scene) {
        this.scene = scene;
        this._create(this.data);
        return this;
    }
    _create(data) {
        this.scene = data.scene;
        const material = new PBRMaterial(this.id, data.scene);
        let synced = false;
        material.onBind = () => {
            const effect = this._material.getEffect();
            /*      if (this?.texture) {
         
      
                effect.setTexture(
                  this.texture.textureID,
                  this.texture.shaderTexture!._texture
                );
              
            }
       */
        };
        const pluginId = `${this.id.replace("#", "")}`;
        const pluginBase = DVEPBRMaterialPlugin;
        const newPlugin = new Function("extendedClass", 
        /* js */ `
      return class ${pluginId} extends extendedClass {
        getClassName() {
          return ${pluginId};
        }
      };
    `)(pluginBase);
        const plugin = new newPlugin(material, pluginId, this, () => { });
        this.plugin = plugin;
        this._material = material;
        if (this.data.alphaTesting) {
            material.alphaMode = Material.MATERIAL_ALPHATEST;
        }
        /*   if (this.data.stencil) {
          material.stencil.enabled = true;
          material.stencil.func = Engine.NOTEQUAL;
          this.scene.setRenderingAutoClearDepthStencil(0, false, false, false);
        } */
        if (this.data.backFaceCulling !== undefined) {
            material.backFaceCulling = this.data.backFaceCulling;
        }
        if (this.id.includes("liquid")) {
            material.roughness = 0.1;
            material.reflectionColor.set(0.1, 0.1, 0.1);
            material.metallic = 1;
            material.reflectivityColor.set(0.8, 0.8, 0.8);
            //  material.wireframe = true;
            material.alphaMode = Material.MATERIAL_ALPHABLEND;
            material.alpha = 0.7;
        }
        else {
            material.metallic = 0.0;
            material.roughness = 0;
            material.reflectionColor.set(0, 0, 0);
        }
        material.emissiveColor;
        // material.sheen.isEnabled = false;
        // material.sheen.intensity = 0;
        //  material.emissiveColor.set(0,0,0);
        // material.ambientColor.set(0,0,0);
        material.anisotropy.dispose();
        //  material.wireframe = true;
        //  material.refraction.set(0.1,0.1,0.1);
        return this._material;
    }
    setTextureArray(samplerId, sampler) {
        throw new Error(`Function not implemented`);
    }
    textures = new Map();
    setTexture(samplerId, sampler) {
        if (!this.plugin.uniformBuffer)
            return;
        this.plugin.uniformBuffer.setTexture(samplerId, sampler);
        this.textures.set(samplerId, sampler);
    }
    clone(scene) {
        for (const [textId, texture] of this.textures) {
            this.plugin.uniformBuffer.setTexture(textId, null);
        }
        const pluginId = `${this.id.replace("#", "")}`;
        const pluginBase = DVEPBRMaterialPlugin;
        const newPlugin = new Function("extendedClass", 
        /* js */ `
      return class ${pluginId} extends extendedClass {
        getClassName() {
          return ${pluginId};
        }
      };
    `)(pluginBase);
        const newMat = PBRMaterial.Parse(this._material.serialize(), scene, "/");
        const plugin = new newPlugin(newMat, pluginId, this, () => { });
        const textures = new Map();
        for (const [textId, texture] of this.textures) {
            const newTexture = texture.clone();
            textures.set(textId, newTexture);
            plugin.uniformBuffer.setTexture(textId, newTexture);
            this.plugin.uniformBuffer.setTexture(textId, texture);
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
    setNumber(uniform, value) {
        if (!this.plugin.uniformBuffer)
            return; // console.warn(`Material is not ready ${uniform} ${this.id}`);
        this.plugin.uniformBuffer.updateFloat(uniform, value);
    }
    setNumberArray(uniform, value) {
        if (!this.plugin.uniformBuffer)
            return console.warn(`Material is not ready ${uniform}`);
        this.plugin.uniformBuffer.updateArray(uniform, value);
    }
    setVector2(uniform, x, y) {
        throw new Error(`Function not implemented`);
    }
    setVector3(uniform, x, y, z) {
        if (!this.plugin.uniformBuffer)
            return;
        this.plugin.uniformBuffer.updateVector3(uniform, new Vector3(x, y, z));
    }
    setVector4(uniform, x, y, z, w) {
        if (!this.plugin.uniformBuffer)
            return;
        this.plugin.uniformBuffer.updateVector3(uniform, new Vector4(x, y, z, w));
    }
    setMatrix(uniform, matrix) {
        if (!this.plugin.uniformBuffer)
            return;
        this.plugin.uniformBuffer.updateMatrix(uniform, matrix);
    }
}
