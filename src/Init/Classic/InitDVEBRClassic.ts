import { DVEBRShaderStore } from "../../Shaders/DVEBRShaderStore";
import { VoxelBaseShader } from "../../Shaders/Code/VoxelBaseShader";
import { ItemShader } from "../../Shaders/Code/ItemShader";
import { VoxelParticleShader } from "../../Shaders/Code/VoxelParticleShader";
import { DVEBRClassicMaterial } from "../../Matereials/Classic/DVEBRClassicMaterial";
import { DVEBRDefaultMaterialBaseData } from "../../Matereials/Types/DVEBRDefaultMaterial.types";
import {
  CreateDefaultRenderer,
  CreateTextures,
} from "../Default/CreateDefaultRenderer";
import { WorkItemProgress } from "@divinevoxel/vlox/Util/WorkItemProgress";
export type DVEBRClassicData = DVEBRDefaultMaterialBaseData & {
  doSun?: boolean;
  doRGB?: boolean;
  doAO?: boolean;
} & {
  getProgress?: (progress: WorkItemProgress) => void;
};
const defaultMaterials = [
  "dve_glow",
  "dve_flora",
  "dve_flora_transparent",
  "dve_solid",
  "dve_transparent",
  "dve_liquid",
];

export default async function InitDVEBRClassic(initData: DVEBRClassicData) {
  const progress = new WorkItemProgress();
  if (initData.getProgress) initData.getProgress(progress);
  progress.startTask("Init Classic Renderer");
  await CreateTextures(initData.scene, initData.textureData, progress);

  //items
  DVEBRShaderStore.setShaderData(
    "dve_item",
    [
      "world",
      "viewProjection",
      "dve_item",
      "dve_item_animation",
      "dve_item_animation_size",
    ],
    ["position", "normal", "textureIndex", "uv"]
  );

  DVEBRShaderStore.storeShader("dve_item", "vertex", ItemShader.GetVertex());

  DVEBRShaderStore.storeShader("dve_item", "frag", ItemShader.GetFragment());

  //voxel particles
  DVEBRShaderStore.setShaderData(
    "dve_voxel_particle",
    [
      "world",
      "viewProjection",
      "dve_voxel",
      "dve_voxel_animation",
      "dve_voxel_animation_size",
    ],
    ["position", "normal", "uv", "color"]
  );

  DVEBRShaderStore.storeShader(
    "dve_voxel_particle",
    "vertex",
    VoxelParticleShader.GetVertex()
  );

  DVEBRShaderStore.storeShader(
    "dve_voxel_particle",
    "frag",
    VoxelParticleShader.GetFragment()
  );

  for (const material of defaultMaterials) {
    DVEBRShaderStore.setShaderData(
      material,
      [
        "world",
        "viewProjection",
        "worldOrigin",
        "cameraPosition",
        "dve_voxel",
        "dve_voxel_animation",
        "dve_voxel_animation_size",
      ],
      ["position", "normal", "voxelData", "textureIndex", "uv", "colors"]
    );
    DVEBRShaderStore.storeShader(
      material,
      "vertex",
      VoxelBaseShader.GetVertex({
        doAO: true,
      })
    );
    DVEBRShaderStore.storeShader(
      material,
      "frag",
      material.includes("liquid")
        ? VoxelBaseShader.GetFragment(
            VoxelBaseShader.DefaultLiquidFragmentMain(true)
          )
        : VoxelBaseShader.GetFragment(VoxelBaseShader.DefaultFragmentMain(true))
    );
  }

  const renderer = await CreateDefaultRenderer({
    progress,
    afterCreate: async () => {},
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
        }
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
  renderer.sceneOptions.levels.baseLevel = 0.1;
  renderer.sceneOptions.levels.sunLevel = 1;
  renderer.sceneOptions.fog.setColor(255, 255, 255);
  renderer.sceneOptions.fog.heightFactor = 0.25;
  renderer.sceneOptions.sky.setColor(130, 174, 255);
  renderer.sceneOptions.sky.horizonStart = 0;
  renderer.sceneOptions.sky.horizon = 64;
  renderer.sceneOptions.sky.horizonEnd = 120;
  renderer.sceneOptions.sky.startBlend = 100;
  renderer.sceneOptions.sky.endBlend = 150;

  renderer.sceneOptions.ubo.buffer.update();

  progress.endTask();
  return renderer;
}
