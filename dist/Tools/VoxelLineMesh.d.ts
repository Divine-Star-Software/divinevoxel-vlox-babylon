import { Vec3Array } from "@amodx/math";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Color4 } from "@babylonjs/core/Maths/math.color";
export declare class VoxelLineMesh extends Mesh {
    scene: Scene;
    name: string;
    static Materials: Map<Scene, ShaderMaterial>;
    positions: number[];
    indices: number[];
    _material: ShaderMaterial;
    color: Color4;
    constructor(scene: Scene, name?: string);
    build(): void;
    setColor(r: number, g: number, b: number, a?: number): void;
    addLineSegment(start: Vec3Array, end: Vec3Array, normal: Vec3Array, thickness: number): void;
    clear(): void;
    dispose(): void;
}
