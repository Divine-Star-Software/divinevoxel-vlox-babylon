import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { PaintVoxelData } from "@divinevoxel/vlox/Voxels";
export declare class VoxelMesher {
    scene: Scene;
    constructor(scene: Scene);
    meshVoxel(voxel: PaintVoxelData): Mesh | null;
}
