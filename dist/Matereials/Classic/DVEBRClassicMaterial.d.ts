import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial.js";
import { Matrix } from "@babylonjs/core/Maths/";
import { ImageArrayTexture } from "../../Textures/ImageArrayTexture.js";
import { MaterialData, MaterialInterface } from "../MaterialInterface.js";
import { SceneOptions } from "../../Scene/SceneOptions.js";
type MatData = MaterialData<{
    textureTypeId: string;
    effectId: string;
    material?: ShaderMaterial;
    textures?: Map<string, ImageArrayTexture | Texture>;
}>;
export declare class DVEBRClassicMaterial implements MaterialInterface<MatData> {
    options: SceneOptions;
    id: string;
    data: MatData;
    scene: Scene;
    _material: ShaderMaterial;
    constructor(options: SceneOptions, id: string, data: MatData);
    createMaterial(scene: Scene): this;
    _create(data: DVEBRClassicMaterial["data"]): ShaderMaterial;
    setTextureArray(samplerId: string, sampler: Texture[]): void;
    textures: Map<string, ImageArrayTexture | Texture>;
    setTexture(samplerId: string, sampler: ImageArrayTexture | Texture): void;
    clone(scene: Scene, sceneOptions: SceneOptions): DVEBRClassicMaterial;
    setNumber(uniform: string, value: number): void;
    setNumberArray(uniform: string, value: ArrayLike<number>): void;
    setVector2(uniform: string, x: number, y: number): void;
    setVector3(uniform: string, x: number, y: number, z: number): void;
    setVector4(uniform: string, x: number, y: number, z: number, w: number): void;
    setMatrix<MatrixType = Matrix>(uniform: string, matrix: MatrixType): void;
}
export {};
