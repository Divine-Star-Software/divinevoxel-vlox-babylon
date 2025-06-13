import type { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo.js";
import { DVESectionMeshes } from "@divinevoxel/vlox/Renderer";
import { DVEBabylonRenderer } from "../Renderer/DVEBabylonRenderer";
import { SectionMesh } from "@divinevoxel/vlox/Renderer";
import { CompactedSectionVoxelMesh } from "@divinevoxel/vlox/Mesher/Geomtry/CompactedSectionVoxelMesh";
import { SubBufferMesh } from "./VoxelScene/SubBufferMesh";
export declare class DVEBRSectionMeshes extends DVESectionMeshes {
    scene: Scene;
    engine: Engine;
    renderer: DVEBabylonRenderer;
    static meshCache: Mesh[];
    pickable: boolean;
    checkCollisions: boolean;
    serialize: boolean;
    defaultBb: BoundingInfo;
    constructor(scene: Scene, engine: Engine, renderer: DVEBabylonRenderer);
    returnMesh(mesh: SubBufferMesh): void;
    updateVertexData(section: SectionMesh, data: CompactedSectionVoxelMesh): SectionMesh;
}
