import { DVEBRClassicMaterial } from "../../Materials/Classic/DVEBRClassicMaterial";
import { DVEBRDefaultMaterialBaseData } from "../../Materials/DVEBRMaterial.types";
import {
  CreateDefaultRenderer,
  CreateTextures,
  RegisterDefaultShaders,
} from "../Default/CreateDefaultRenderer";
import { WorkItemProgress } from "@divinevoxel/vlox/Util/WorkItemProgress";
import { EngineSettings } from "@divinevoxel/vlox/Settings/EngineSettings";
import { SceneUBO } from "../../Scene/SceneUBO";
import { Camera } from "@babylonjs/core/Cameras/camera";
export type DVEBRClassicData = DVEBRDefaultMaterialBaseData & {
  doSun?: boolean;
  doRGB?: boolean;
  doAO?: boolean;
} & {
  camera?: Camera;
  getProgress?: (progress: WorkItemProgress) => void;
};
export default async function InitDVEBRClassic(initData: DVEBRClassicData) {
  if (initData.textureSize) {
    EngineSettings.settings.rendererSettings.textureSize = [
      ...initData.textureSize,
    ];
  }
  const progress = new WorkItemProgress();
  if (initData.getProgress) initData.getProgress(progress);
  progress.startTask("Init Classic Renderer");
  const engine = initData.scene.getEngine();
  SceneUBO.UniformBufferSupported = engine.supportsUniformBuffers;
  RegisterDefaultShaders();
  await CreateTextures(initData.scene, initData.textureData, progress);

  const renderer = await CreateDefaultRenderer({
    progress,
    createMaterial: (renderer, scene, matData) => {
      const newMat = new DVEBRClassicMaterial(
        renderer.sceneOptions,
        matData.id,
        {
          scene,
          data: {
            effectId: matData.shaderId,
            textureTypeId: matData.textureTypeId || "",
          },
          ...matData,
        },
      );
      newMat.createMaterial(scene);
      return newMat;
    },
    scene: initData.scene,
    textureData: initData.textureData,
    textureTypes: initData.textureTypes,
    substances: initData.substances,
  });

  renderer.sceneOptions.shade.doSun = true;
  renderer.sceneOptions.shade.doRGB = true;
  renderer.sceneOptions.shade.doAO = true;
  renderer.sceneOptions.shade.doColor = true;
  renderer.sceneOptions.levels.baseLevel = 0.2;
  renderer.sceneOptions.levels.sunLevel = 1;
  renderer.sceneOptions.fog.setColor(255, 255, 255);
  renderer.sceneOptions.fog.heightFactor = 0.25;
  renderer.sceneOptions.sky.setColor(130, 174, 255);
  renderer.sceneOptions.sky.horizon = 64;
  renderer.sceneOptions.sky.horizonStart = 0;
  renderer.sceneOptions.sky.horizonEnd = 120;
  renderer.sceneOptions.sky.startBlend = 100;
  renderer.sceneOptions.sky.endBlend = 150;

  renderer.sceneOptions.ubo.buffer?.update();

  progress.endTask();
  return renderer;
}
