import { DVEBRPBRMaterial } from "../../Matereials/PBR/DVEBRPBRMaterial";
import { DVEBRDefaultMaterialBaseData } from "../../Matereials/DVEBRMaterial.types";
import {
  CreateDefaultRenderer,
  CreateTextures,
  RegisterDefaultShaders,
} from "../Default/CreateDefaultRenderer";
import { WorkItemProgress } from "@divinevoxel/vlox/Util/WorkItemProgress";
import { EngineSettings } from "@divinevoxel/vlox/Settings/EngineSettings";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { SceneUBO } from "../../Scene/SceneUBO";
export type DVEBRPBRData = DVEBRDefaultMaterialBaseData & {
  camera: Camera;
  getProgress?: (progress: WorkItemProgress) => void;
};

export default async function InitDVEPBR(initData: DVEBRPBRData) {
  console.log("init dve pbr", initData);
  if (initData.textureSize) {
    EngineSettings.settings.rendererSettings.textureSize = [
      ...initData.textureSize,
    ];
  }
  const progress = new WorkItemProgress();
  if (initData.getProgress) initData.getProgress(progress);
  progress.startTask("Init PBR Renderer");
  const scene = initData.scene;
  const engine = initData.scene.getEngine();
  SceneUBO.UniformBufferSuppourted = engine.supportsUniformBuffers;
  RegisterDefaultShaders();

  await CreateTextures(scene, initData.textureData, progress);
 
  return await CreateDefaultRenderer({
    progress,
    createMaterial: (renderer, scene, matData) => {
      const newMat = new DVEBRPBRMaterial(renderer.sceneOptions, matData.id, {
        scene,
        data: {
          effectId: matData.shaderId,
          textureTypeId: matData.textureTypeId || "",
        },
        ...matData,
      });
      newMat.createMaterial(scene);
      return newMat;
    },
    scene: scene,
    textureData: initData.textureData,
    textureTypes: initData.textureTypes,
    substances: initData.substances
  });
}
