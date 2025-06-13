import { Engine } from "@babylonjs/core/Engines/engine";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial.js";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/";
import { TextureManager } from "@divinevoxel/vlox/Textures/TextureManager.js";
import { DVEBRShaderStore } from "../../Shaders/DVEBRShaderStore.js";
import { ImageArrayTexture } from "../../Textures/ImageArrayTexture.js";
export class DVEBRClassicMaterial {
    options;
    id;
    data;
    scene;
    _material;
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
        if (this.data.data.material && this.data.data.textures) {
            this._material = this.data.data.material;
            this.textures = this.data.data.textures;
            return this._material;
        }
        let texture;
        let animationTexture;
        if (data.data.textureTypeId) {
            texture = TextureManager.getTexture(data.data.textureTypeId ? data.data.textureTypeId : this.id);
            if (!texture && data.data.textureTypeId) {
                throw new Error(`Could find the texture type for material ${this.id}. Texture typeid:  ${data.data.textureTypeId}`);
            }
            animationTexture = texture.animatedTexture;
        }
        const shaderData = DVEBRShaderStore.getShaderData(this.data.data.effectId);
        if (!shaderData) {
            throw new Error(`Could not find shader data for ${this.data.data.effectId}`);
        }
        const shaderMaterial = new ShaderMaterial(this.id, data.scene, this.id, {
            ...shaderData,
            needAlphaBlending: data.alphaBlending,
            needAlphaTesting: data.alphaTesting,
            uniformBuffers: ["SceneOptions"],
        }, false);
        shaderMaterial.setUniformBuffer("SceneOptions", this.options.ubo.buffer);
        if (data.backFaceCulling !== undefined) {
            shaderMaterial.backFaceCulling = data.backFaceCulling;
        }
        let liquid = false;
        if (this.id.includes("transparent")) {
            shaderMaterial.forceDepthWrite = true;
            shaderMaterial.backFaceCulling = true;
        }
        if (this.id.includes("flora")) {
            shaderMaterial.alphaMode = Engine.ALPHA_COMBINE;
            shaderMaterial.backFaceCulling = true;
        }
        if (this.id.includes("liquid")) {
            liquid = true;
            shaderMaterial.forceDepthWrite = true;
            shaderMaterial.backFaceCulling = false;
            this.scene.setRenderingAutoClearDepthStencil(0, false, false, false);
        }
        this._material = shaderMaterial;
        if (texture) {
            this.setTexture(texture.id, texture.shaderTexture);
            this.setTexture(`${texture.id}_animation`, animationTexture.shaderTexture);
            this._material.setInt(`${texture.id}_animation_size`, animationTexture._size);
        }
        return this._material;
    }
    setTextureArray(samplerId, sampler) {
        this._material.setTextureArray(samplerId, sampler);
    }
    textures = new Map();
    //@ts-ignore
    setTexture(samplerId, sampler) {
        this._material.setTexture(samplerId, sampler);
        this.textures.set(samplerId, sampler);
    }
    clone(scene, sceneOptions) {
        const textures = new Map();
        for (const [textId, texture] of this.textures) {
            this._material.removeTexture(textId);
        }
        const newMat = ShaderMaterial.Parse(this._material.serialize(), scene, "/");
        for (const [textId, texture] of this.textures) {
            if (texture instanceof ImageArrayTexture) {
                const newTexture = texture.copy(scene);
                textures.set(textId, newTexture);
                newMat.setTexture(textId, newTexture);
                this._material.setTexture(textId, texture);
            }
            if (texture instanceof RawTexture) {
                const newTexture = new RawTexture(texture.metadata.buffer || new ArrayBuffer(4), texture.getSize().width, texture.getSize().height, texture.format, scene, false, false, Texture.NEAREST_NEAREST, texture.textureType);
                textures.set(textId, newTexture);
                newMat.setTexture(textId, newTexture);
                this._material.setTexture(textId, texture);
            }
        }
        const mat = new DVEBRClassicMaterial(sceneOptions, this.id, {
            ...this.data,
            data: {
                ...this.data.data,
                material: newMat,
                textures,
            },
        });
        newMat.setUniformBuffer("SceneOptions", sceneOptions.ubo.buffer);
        mat._material = newMat;
        mat.textures = textures;
        return mat;
    }
    setNumber(uniform, value) {
        this._material.setFloat(uniform, value);
    }
    setNumberArray(uniform, value) {
        this._material.setFloats(uniform, value);
    }
    setVector2(uniform, x, y) {
        this._material.setVector2(uniform, new Vector2(x, y));
    }
    setVector3(uniform, x, y, z) {
        this._material.setVector3(uniform, new Vector3(x, y, z));
    }
    setVector4(uniform, x, y, z, w) {
        this._material.setVector4(uniform, new Vector4(x, y, z, w));
    }
    setMatrix(uniform, matrix) {
        this._material.setMatrix(uniform, matrix);
    }
}
