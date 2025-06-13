import { DVERenderer } from "@divinevoxel/vlox/Renderer/DVERenderer";
import { DVEBRMeshCuller } from "./DVEBRMeshCuller";
import { DVEBRFOManager } from "./DVEBRFOManger";
import { Observable } from "@amodx/core/Observers/Observable.js";
import { DVEBRSectionMeshes } from "../Meshes/DVEBRSectionMeshesN";
import { DVEBRMaterialRegister } from "../Matereials/DVEBRNodeMaterialsManager";
import { VoxelScene } from "../Scene/VoxelScene";
export class DVEBabylonRenderer extends DVERenderer {
    static instance;
    observers = {
        meshCreated: new Observable(),
        meshDisposed: new Observable(),
    };
    sectorMeshes;
    engine;
    scene;
    foManager;
    meshCuller;
    materials = new DVEBRMaterialRegister();
    voxelScene;
    constructor(data) {
        super();
        this.engine = data.scene.getEngine();
        this.scene = data.scene;
        this.voxelScene = new VoxelScene(this);
        this.foManager = new DVEBRFOManager();
        this.meshCuller = new DVEBRMeshCuller();
        this.sectorMeshes = new DVEBRSectionMeshes(data.scene, this.engine, this);
        this.meshCuller.init(this.scene);
        if (!DVEBabylonRenderer.instance)
            DVEBabylonRenderer.instance = this;
        return DVEBabylonRenderer.instance;
    }
    async init(dver) {
        this.voxelScene.init(this.scene);
        this.scene.registerBeforeRender(() => {
            this.voxelScene.beforRender();
        });
    }
}
