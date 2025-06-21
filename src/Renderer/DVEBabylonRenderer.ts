import { DVERenderer } from "@divinevoxel/vlox/Renderer/DVERenderer";
import { Scene } from "@babylonjs/core/scene";
import { DVEBRMeshCuller } from "./DVEBRMeshCuller";
import { DVEBRFOManager } from "./DVEBRFOManger";
import { DivineVoxelEngineRender } from "@divinevoxel/vlox/Contexts/Render/DivineVoxelEngineRender.js";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DVEBRSectionMeshes } from "../Meshes/DVEBRSectionMeshesN";
import { DVEBRMaterialRegister } from "../Matereials/DVEBRNodeMaterialsManager";
import { VoxelScene } from "../Scene/VoxelScene";
export interface DVEBabylonRendererInitData {
  scene: Scene;
}
export class DVEBabylonRenderer extends DVERenderer {
  static instance: DVEBabylonRenderer;
  sectorMeshes: DVEBRSectionMeshes;
  engine: Engine;
  scene: Scene;
  foManager: DVEBRFOManager;
  meshCuller: DVEBRMeshCuller;

  materials = new DVEBRMaterialRegister();

  voxelScene: VoxelScene;

  constructor(data: DVEBabylonRendererInitData) {
    super();
    this.engine = data.scene.getEngine() as any;
    this.scene = data.scene;
    this.voxelScene = new VoxelScene(this);
    this.foManager = new DVEBRFOManager();
    this.meshCuller = new DVEBRMeshCuller();

    this.sectorMeshes = new DVEBRSectionMeshes(data.scene, this.engine, this);

    this.meshCuller.init(this.scene);
    if (!DVEBabylonRenderer.instance) DVEBabylonRenderer.instance = this;

    return DVEBabylonRenderer.instance;
  }

  async init(dver: DivineVoxelEngineRender) {
    this.voxelScene.init(this.scene);

    this.scene.registerBeforeRender(() => {
      this.voxelScene.beforRender();
    });
  }
}
