import { DVEBRShaderStore } from "../../Shaders/DVEBRShaderStore";
import { DVEBabylonRenderer } from "../../Renderer/DVEBabylonRenderer.js";
import {
  DVEBRDefaultMaterialBaseData,
  NodeSubstanceData,
} from "../../Materials/DVEBRMaterial.types.js";

import type { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { NodeMaterialData } from "@divinevoxel/vlox/Renderer/DVERenderNode.types";

import { TextureManager } from "@divinevoxel/vlox/Textures/TextureManager";
import InitDefaultEffects from "../../Effects/InitDefaultEffects.js";
import { TextureData } from "@divinevoxel/vlox/Textures/Texture.types.js";
import { ImageArrayTexture } from "../../Textures/ImageArrayTexture.js";
import { CacheManager } from "@divinevoxel/vlox/Cache/CacheManager.js";
import { MaterialInterface } from "../../Materials/MaterialInterface.js";
import { WorkItemProgress } from "@divinevoxel/vlox/Util/WorkItemProgress.js";
import "@babylonjs/core/Animations/animatable";
import { EngineSettings } from "@divinevoxel/vlox/Settings/EngineSettings.js";
import { SceneUBO } from "../../Scene/SceneUBO.js";
import { VoxelBaseShader } from "../../Shaders/Code/VoxelBaseShader";
import { ItemShader } from "../../Shaders/Code/ItemShader";
import { VoxelParticleShader } from "../../Shaders/Code/VoxelParticleShader";
import { VoxelPBRShader } from "../../Shaders/Code/VoxelPBRShader";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { Geometry } from "@babylonjs/core/Meshes/geometry.js";
import { DVEBRVoxelMesh } from "../../Meshes/DVEBRVoxelMesh.js";
import { VoxelMeshVertexStructCursor } from "@divinevoxel/vlox/Mesher/Voxels/Geometry/VoxelMeshVertexStructCursor";

const defaultMaterials = [
  "dve_glow",
  "dve_flora",
  "dve_flora_transparent",
  "dve_solid",
  "dve_transparent",
  "dve_liquid",
];

export function RegisterDefaultShaders() {
  //items
  DVEBRShaderStore.setShaderData(
    "dve_item",
    ["world", "view", "viewProjection", "dve_item_animation_size"],
    ["position", "normal", "textureIndex", "uv"],
    ["dve_item", "dve_item_animation"],
  );

  DVEBRShaderStore.storeShader("dve_item", "vertex", ItemShader.GetVertex());

  DVEBRShaderStore.storeShader("dve_item", "frag", ItemShader.GetFragment());

  //voxel particles
  DVEBRShaderStore.setShaderData(
    "dve_voxel_particle",
    ["world", "view", "viewProjection", "dve_voxel_animation_size"],
    ["position", "normal", "uv", "color"],
    ["dve_voxel", "dve_voxel_animation"],
  );

  DVEBRShaderStore.storeShader(
    "dve_voxel_particle",
    "vertex",
    VoxelParticleShader.GetVertex(),
  );

  DVEBRShaderStore.storeShader(
    "dve_voxel_particle",
    "frag",
    VoxelParticleShader.GetFragment(),
  );

  for (const material of defaultMaterials) {
    DVEBRShaderStore.setShaderData(
      material,
      [
        "world",
        "viewProjection",
        "worldOrigin",
        "cameraPosition",
        "dve_voxel_animation_size",
      ],
      ["position", "normal", "textureIndex", "uv", "color", "voxelData"],
      ["dve_voxel", "dve_voxel_animation"],
      {
        vertexUpdates: material.includes("liquid")
          ? VoxelPBRShader.GetLiquidVertexUpdates({ name: material })
          : VoxelPBRShader.GetVertexUpdates({ name: material }),
        fragmentUpdates: VoxelPBRShader.GetFragmentUpdates({
          name: material,
          doAO: !material.includes("liquid"),
        }),
      },
    );

    DVEBRShaderStore.storeShader(
      material,
      "vertex",
      VoxelBaseShader.GetVertex({
        doAO: true,
      }),
    );
    DVEBRShaderStore.storeShader(
      material,
      "frag",
      material.includes("liquid")
        ? VoxelBaseShader.GetFragment({
            main: VoxelBaseShader.DefaultLiquidFragmentMain(),
          })
        : VoxelBaseShader.GetFragment({
            main: VoxelBaseShader.DefaultFragmentMain(),
          }),
    );
  }
}

export async function CreateTextures(
  scene: Scene,
  textureData: TextureData[],
  progress: WorkItemProgress,
) {
  progress.setStatus("Creating Textures");
  if (CacheManager.cacheLoadEnabled && CacheManager.cachedData?.textures) {
    TextureManager.registerTexture(CacheManager.cachedData.textures);
  } else {
    TextureManager.registerTexture(textureData);
  }

  await TextureManager.compiledTextures(
    {
      createCache: CacheManager.cacheStoreEnabled,
      finalSize: EngineSettings.settings.rendererSettings.textureSize,
    },
    progress,
  );

  for (const [key, type] of TextureManager._compiledTextures) {
    if (!type.images!.length) continue;
    type.shaderTexture = new ImageArrayTexture(type.images!, scene);
    const animatedTexture = type.animatedTexture;
    animatedTexture.build();
    animatedTexture.shaderTexture = new RawTexture(
      animatedTexture._buffer,
      animatedTexture._size,
      animatedTexture._size,
      Engine.TEXTUREFORMAT_RED_INTEGER,
      null,
      false,
      undefined,
      Engine.TEXTURE_NEAREST_NEAREST,
      Engine.TEXTURETYPE_UNSIGNED_SHORT,
    );
    (animatedTexture.shaderTexture as RawTexture).metadata = {
      buffer: animatedTexture._buffer,
    };
  }
  progress.setStatus("Done");
  await progress.nextFrame();
}

async function PrecompileVoxelMaterials(
  scene: Scene,
  mats: MaterialInterface[],
) {
  const mesh = new Mesh("", scene);
  mesh.isVisible = false;
  mesh.isPickable = false;
  mesh.doNotSerialize = true;
  new Geometry(Geometry.RandomId(), scene, undefined, false, mesh);
  DVEBRVoxelMesh.UpdateVertexDataBuffers(
    mesh,
    scene.getEngine() as Engine,
    new Float32Array(VoxelMeshVertexStructCursor.VertexFloatSize * 3),
    new Uint32Array([0, 1, 2]),
  );
  await Promise.all(
    mats.map((mat) => {
      const material = mat._material;
      if (material._storeEffectOnSubMeshes) {
        return material.forceCompilationAsync(mesh).catch((error) => {
          console.warn(`Failed to precompile material ${mat.id}`, error);
        });
      }
      return new Promise<void>((resolve) => {
        let tries = 0;
        const check = () => {
          if (material.isReady(mesh)) return resolve();
          if (++tries > 300) {
            console.warn(`Failed to precompile material ${mat.id}`);
            return resolve();
          }
          setTimeout(check, 16);
        };
        check();
      });
    }),
  );
  mesh.dispose();
}

export async function CreateDefaultRenderer(
  initData: DVEBRDefaultMaterialBaseData & {
    scene: Scene;
    createMaterial: (
      renderer: DVEBabylonRenderer,
      scene: Scene,
      matData: NodeMaterialData,
    ) => MaterialInterface;
    progress: WorkItemProgress;
  },
): Promise<DVEBabylonRenderer> {
  const { scene, progress } = initData;
  progress.setStatus("Creating Default Renderer");
  progress.setWorkLoad(4);
  const renderer = DVEBabylonRenderer.instance
    ? DVEBabylonRenderer.instance
    : new DVEBabylonRenderer({
        scene,
      });

  const DefaultSubstances: NodeSubstanceData[] = defaultMaterials.map((id) => {
    return {
      id,
      material: {
        alphaBlending:
          id == "dve_liquid" ||
          id == "dve_transparent" ||
          id == "dve_flora_transparent"
            ? true
            : false,
        alphaTesting:
          id != "dve_liquid" &&
          id != "dve_transparent" &&
          id != "dve_flora_transparent"
            ? false
            : true,
        alpha: id == "dve_liquid" ? 0.7 : undefined,
        backFaceCulling: id == "dve_liquid" ? false : true,
        forceDepthWrite:
          id == "dve_transparent" || id == "dve_flora_transparent"
            ? true
            : false,
        stencil: id == "dve_liquid" ? true : undefined,
        separateCullingPass: id == "dve_liquid" ? true : undefined,
        mipMapBias: -0.6,
        pbr: {
          roughness: id == "dve_liquid" ? 0 : 1,
          metallic: id == "dve_liquid" ? 0.5 : 0,
          reflectionColor: id == "dve_liquid" ? [0.1, 0.1, 0.1] : [0, 0, 0],
          reflectivityColor: id == "dve_liquid" ? [1, 1, 1] : undefined,
        },
      },
      textureType: "dve_voxel",
      shaderId: id,
      mesh: {
        boundingBoxMaxSize: [1, 1, 1],
        type: "chunk",
      },
    };
  });
  const substances = [...DefaultSubstances, ...initData.substances];
  const mats: MaterialInterface[] = [];
  const voxelMats: MaterialInterface[] = [];

  for (const substance of substances) {
    const mat = {
      id: substance.id,
      shaderId: substance.id,
      textureTypeId: "dve_voxel",
      ...substance.material,
    };

    const newMat = initData.createMaterial(renderer, scene, mat);
    renderer.materials.register(mat.id, newMat);
    if (substance.textures) {
      for (const key in substance.textures) {
        const text = substance.textures[key];
        newMat.setTexture(key, text);
      }
    }
    mats.push(newMat);
    voxelMats.push(newMat);
  }

  const materials: NodeMaterialData[] = [];
  materials.push(
    {
      id: "dve_item",
      shaderId: "dve_item",
      textureTypeId: "dve_item",
      alphaBlending: false,
      alphaTesting: true,
    },
    {
      id: "dve_voxel_particle",
      shaderId: "dve_voxel_particle",
      textureTypeId: "dve_voxel",
      alphaBlending: true,
      alphaTesting: false,
    },
  );

  for (const mat of materials) {
    const newMat = initData.createMaterial(renderer, scene, mat);
    renderer.materials.register(mat.id, newMat);
    mats.push(newMat);
  }
  const needUBOSync = !SceneUBO.UniformBufferSupported;
  let time = 0;
  scene.onBeforeRenderObservable.add((scene) => {
    if (scene.deltaTime === undefined) return;
    for (const [key, type] of TextureManager._compiledTextures) {
      if (type.animatedTexture.tick(scene.deltaTime)) {
        (type.animatedTexture.shaderTexture as RawTexture).update(
          type.animatedTexture._buffer,
        );
      }
    }
    renderer.sceneOptions.ubo.updateTime(time);
    time += 0.1;
    if (needUBOSync) {
      renderer.sceneOptions.ubo.observers.beforeSync.notifyObservers(null);
      for (const mat of mats) {
        mat.syncUBO();
      }
      renderer.sceneOptions.ubo._clearDirtyUniforms();
    } else {
      renderer.sceneOptions.ubo.update();
    }
  });

  InitDefaultEffects();
  await PrecompileVoxelMaterials(scene, voxelMats);
  progress.completeWorkItems(4);
  progress.setStatus("Done");
  await progress.nextFrame();
  return renderer;
}
