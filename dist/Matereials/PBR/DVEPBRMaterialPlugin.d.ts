import type { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { UniformBuffer } from "@babylonjs/core/Materials/uniformBuffer";
import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";
import { DVEBRPBRMaterial } from "./DVEBRPBRMaterial";
export declare class DVEPBRMaterialPlugin extends MaterialPluginBase {
    dveMaterial: DVEBRPBRMaterial;
    onUBSet: (uniformBuffer: UniformBuffer) => void;
    uniformBuffer: UniformBuffer;
    id: `${string}-${string}-${string}-${string}-${string}`;
    constructor(material: PBRMaterial, name: string, dveMaterial: DVEBRPBRMaterial, onUBSet: (uniformBuffer: UniformBuffer) => void);
    hasTexture(texture: BaseTexture): boolean;
    prepareDefines(defines: any): void;
    getClassName(): string;
    _textureBound: boolean;
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine): void;
    getCustomCode(shaderType: any): {
        CUSTOM_VERTEX_DEFINITIONS: string;
        CUSTOM_VERTEX_UPDATE_NORMAL: string;
        CUSTOM_VERTEX_MAIN_BEGIN: string;
        CUSTOM_FRAGMENT_DEFINITIONS?: undefined;
        CUSTOM_FRAGMENT_UPDATE_ALBEDO?: undefined;
        CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION?: undefined;
        CUSTOM_FRAGMENT_MAIN_END?: undefined;
    } | {
        CUSTOM_FRAGMENT_DEFINITIONS: string;
        CUSTOM_FRAGMENT_UPDATE_ALBEDO: string;
        CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION: string;
        CUSTOM_FRAGMENT_MAIN_END: string;
        CUSTOM_VERTEX_DEFINITIONS?: undefined;
        CUSTOM_VERTEX_UPDATE_NORMAL?: undefined;
        CUSTOM_VERTEX_MAIN_BEGIN?: undefined;
    } | null;
}
