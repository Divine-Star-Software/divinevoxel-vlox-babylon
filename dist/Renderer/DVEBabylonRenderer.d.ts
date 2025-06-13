import { DVERenderer } from "@divinevoxel/vlox/Renderer/DVERenderer";
import { Scene } from "@babylonjs/core/scene";
import { DVEBRMeshCuller } from "./DVEBRMeshCuller";
import { DVEBRFOManager } from "./DVEBRFOManger";
import { DivineVoxelEngineRender } from "@divinevoxel/vlox/Contexts/Render/DivineVoxelEngineRender.js";
import { Observable } from "@amodx/core/Observers/Observable.js";
import { DVEBRMesh } from "../Meshes/DVEBRMesh.js";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DVEBRSectionMeshes } from "../Meshes/DVEBRSectionMeshesN";
import { DVEBRMaterialRegister } from "../Matereials/DVEBRNodeMaterialsManager";
import { VoxelScene } from "../Scene/VoxelScene";
export interface DVEBabylonRendererInitData {
    scene: Scene;
}
export declare class DVEBabylonRenderer extends DVERenderer {
    static instance: DVEBabylonRenderer;
    observers: {
        meshCreated: Observable<DVEBRMesh>;
        meshDisposed: Observable<DVEBRMesh>;
    };
    sectorMeshes: DVEBRSectionMeshes;
    engine: Engine;
    scene: Scene;
    foManager: DVEBRFOManager;
    meshCuller: DVEBRMeshCuller;
    materials: DVEBRMaterialRegister;
    voxelScene: VoxelScene;
    constructor(data: DVEBabylonRendererInitData);
    init(dver: DivineVoxelEngineRender): Promise<void>;
}
