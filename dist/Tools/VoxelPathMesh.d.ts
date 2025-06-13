import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { VoxelPath, VoxelPathSegment } from "@divinevoxel/vlox/Templates/Path/VoxelPath";
export declare class VoxelPathSegmentMesh extends Mesh {
    pathMesh: VoxelPathMesh;
    path: VoxelPath;
    segment: VoxelPathSegment;
    positions: number[];
    indices: number[];
    private _dispose;
    _dirty: boolean;
    constructor(pathMesh: VoxelPathMesh, path: VoxelPath, segment: VoxelPathSegment);
    update(): void;
    build(): void;
    clear(): void;
    dispose(): void;
}
export declare class VoxelPathMesh {
    scene: Scene;
    name: string;
    static Materials: Map<Scene, ShaderMaterial>;
    _material: ShaderMaterial;
    color: Color4;
    path: VoxelPath;
    segments: VoxelPathSegmentMesh[];
    constructor(scene: Scene, name?: string);
    setColor(r: number, g: number, b: number, a?: number): void;
    setPath(path: VoxelPath): void;
    build(): void;
    dispose(): void;
    clear(): void;
}
