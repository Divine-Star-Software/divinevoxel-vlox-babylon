import { DVERenderer } from "@divinevoxel/vlox/Renderer/DVERenderer";
import { Scene } from "@babylonjs/core/scene";
import { DVEBRMeshCuller } from "./DVEBRMeshCuller";
import { DVEBRFOManager } from "./DVEBRFOManger";
import { DivineVoxelEngineRender } from "@divinevoxel/vlox/Contexts/Render/DivineVoxelEngineRender.js";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DVEBRSectionMeshesSingleBuffer } from "../Scene/SingleBuffer/DVEBRSectionMeshesSingleBuffer";
import { DVEBRMaterialRegister } from "../Matereials/DVEBRNodeMaterialsManager";
import { EngineSettings } from "@divinevoxel/vlox/Settings/EngineSettings";
import { SingleBufferVoxelScene } from "../Scene/SingleBuffer/SingleBufferVoxelScene";
import { SceneOptions } from "../Scene/SceneOptions";
import { DVEBRSectionMeshesMultiBuffer } from "../Scene/MultiBuffer/DVEBRSectionMeshesMultiBuffer";
export interface DVEBabylonRendererInitData {
  scene: Scene;
}
export class DVEBabylonRenderer extends DVERenderer {
  static instance: DVEBabylonRenderer;
  sectorMeshes: DVEBRSectionMeshesSingleBuffer | DVEBRSectionMeshesMultiBuffer;
  engine: Engine;
  scene: Scene;
  foManager: DVEBRFOManager;
  meshCuller: DVEBRMeshCuller;

  materials = new DVEBRMaterialRegister();

  sceneOptions: SceneOptions;

  constructor(data: DVEBabylonRendererInitData) {
    super();
    this.engine = data.scene.getEngine() as any;
    this.scene = data.scene;
    this.foManager = new DVEBRFOManager();
    this.meshCuller = new DVEBRMeshCuller();

    this.sceneOptions = new SceneOptions(this.scene);
    if (EngineSettings.settings.rendererSettings.bufferMode == "single") {
      this.sectorMeshes = new DVEBRSectionMeshesSingleBuffer(
        data.scene,
        this.engine,
        this,
        new SingleBufferVoxelScene(this, this.sceneOptions)
      );
    } else {
      this.sectorMeshes = new DVEBRSectionMeshesMultiBuffer(
        data.scene,
        this.engine,
        this
      );
    }

    this.meshCuller.init(
      this.scene,
      EngineSettings.settings.rendererSettings.bufferMode
    );
    if (!DVEBabylonRenderer.instance) DVEBabylonRenderer.instance = this;

    return DVEBabylonRenderer.instance;
  }

  async init(dver: DivineVoxelEngineRender) {
    if (this.sectorMeshes instanceof DVEBRSectionMeshesSingleBuffer) {
      const sectorMeshes = this.sectorMeshes as DVEBRSectionMeshesSingleBuffer;
      sectorMeshes.voxelScene.init(this.scene);

      this.scene.registerBeforeRender(() => {
        sectorMeshes.voxelScene.beforRender();
      });
    }
  }
}
