import type { Scene } from "@babylonjs/core/scene";
import type { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { VoxelMeshBVHBuilder } from "@divinevoxel/vlox/Mesher/Geomtry/VoxelMeshBVHBuilder";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
declare class VoxelGeometryIntersectResult {
    hit: boolean;
    normal: Vector3;
    position: Vector3;
    uv: Vector2;
    triangleId: number;
    constructor(hit: boolean, normal: Vector3, position: Vector3, uv: Vector2, triangleId: number);
}
declare class VoxelMeshIntersectResult {
    found: boolean;
    foundObject: number;
    t: number;
    error: boolean;
    triangle: VoxelGeometryIntersectResult;
    constructor(found: boolean, foundObject: number, t: number, error: boolean, triangle: VoxelGeometryIntersectResult);
}
export declare class BVHViewer {
    mesh: Mesh;
    scene: Scene;
    vertices: Float32Array;
    indices: Uint32Array;
    tool: VoxelMeshBVHBuilder;
    _boxes: InstancedMesh[];
    static _box: Mesh;
    static _hitBox: Mesh;
    static _parentBox: Mesh;
    static _material: StandardMaterial;
    static _hitMaterial: StandardMaterial;
    static _parentMaterial: StandardMaterial;
    static instances: Set<BVHViewer>;
    constructor(mesh: Mesh, scene: Scene, tree: Float32Array, treeIndices: Uint32Array, vertices: Float32Array, indices: Uint32Array);
    dispose(): void;
    testIntersection(rayOrigin: Vector3, rayDirectoin: Vector3): VoxelMeshIntersectResult;
    createBoxes(level: number, ro?: Vector3, rd?: Vector3): void;
}
export {};
