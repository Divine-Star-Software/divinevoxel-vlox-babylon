import { PBRBaseMaterial } from "@babylonjs/core/Materials/PBR/pbrBaseMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { DVEPBRMaterialPlugin } from "./DVEPBRMaterialPlugin";
import { IMatrixLike } from "@babylonjs/core/Maths/math.like";
import { MaterialData, MaterialInterface } from "../MaterialInterface.js";
import { SceneOptions } from "../../Scene/SceneOptions";
export type DVEBRPBRMaterialData = MaterialData<{
    textureTypeId: string;
    effectId: string;
    material?: PBRBaseMaterial;
    plugin?: DVEPBRMaterialPlugin;
    textures?: Map<string, Texture>;
}>;
export declare class DVEBRPBRMaterial implements MaterialInterface {
    options: SceneOptions;
    id: string;
    data: DVEBRPBRMaterialData;
    static ready: boolean;
    _material: PBRMaterial;
    scene: Scene;
    plugin: DVEPBRMaterialPlugin;
    afterCreate: ((material: PBRMaterial) => void)[];
    constructor(options: SceneOptions, id: string, data: DVEBRPBRMaterialData);
    createMaterial(scene: Scene): this;
    _create(data: DVEBRPBRMaterialData): PBRMaterial;
    setTextureArray(samplerId: string, sampler: Texture[]): void;
    textures: Map<string, Texture>;
    setTexture(samplerId: string, sampler: Texture): void;
    clone(scene: Scene): DVEBRPBRMaterial;
    setNumber(uniform: string, value: number): void;
    setNumberArray(uniform: string, value: ArrayLike<number>): void;
    setVector2(uniform: string, x: number, y: number): void;
    setVector3(uniform: string, x: number, y: number, z: number): void;
    setVector4(uniform: string, x: number, y: number, z: number, w: number): void;
    setMatrix<MatrixType = IMatrixLike>(uniform: string, matrix: MatrixType): void;
}
