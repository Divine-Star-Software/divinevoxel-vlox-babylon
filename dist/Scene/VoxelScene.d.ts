import { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import { Scene } from "@babylonjs/core/scene";
import { SubMesh } from "@babylonjs/core/Meshes/subMesh";
import { CompactedMeshData } from "@divinevoxel/vlox/Mesher/Geomtry/CompactedSectionVoxelMesh";
import { DVEBabylonRenderer } from "../Renderer/DVEBabylonRenderer";
import { BufferMesh } from "../Meshes/VoxelScene/BufferMesh";
import { SubBufferMesh } from "../Meshes/VoxelScene/SubBufferMesh";
import { SceneOptions } from "./SceneOptions";
export declare class VoxelScene {
    renderer: DVEBabylonRenderer;
    _material: MultiMaterial;
    _meshBuffers: BufferMesh[];
    active: Map<SubMesh, SubBufferMesh>;
    options: SceneOptions;
    constructor(renderer: DVEBabylonRenderer);
    init(scene: Scene): void;
    _addBufferMesh(): BufferMesh;
    removeMesh(mesh: SubBufferMesh): null;
    updateMesh(subBufferMesh: SubBufferMesh, data: CompactedMeshData): SubBufferMesh | null;
    addMesh(data: CompactedMeshData, x: number, y: number, z: number): SubBufferMesh;
    beforRender(): void;
    render(): void;
}
