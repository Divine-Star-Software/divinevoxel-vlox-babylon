import { Scene } from "@babylonjs/core/scene";
import { Vec2Array, Vec3Array } from "@amodx/math";
import { TextureData } from "@divinevoxel/vlox/Textures/Texture.types";
import { DVEBabylonRenderer } from "Renderer/DVEBabylonRenderer";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

export type DVEBRDefaultMaterialBaseData = {
  textureData: TextureData[];
  textureSize?: Vec2Array;
  textureTypes: string[];
  substances: NodeSubstanceData[];
  scene: Scene;
};

export type NodeMaterialOptions = {
  alphaTesting: boolean;
  alphaBlending: boolean;
  mipMapBias?: number;
  hasEffects?: boolean;
  backFaceCulling?: boolean;
  stencil?: boolean;
  alpha?: number;
  forceDepthWrite?: boolean;
  separateCullingPass?: boolean;
  pbr?: {
    roughness?: number;
    metallic?: number;
    reflectionColor?: Vec3Array;
    reflectivityColor?: Vec3Array;
  };
};

export type NodeMeshData = {
  id: string;
  type?: string;
};

export type NodeSubstanceData = {
  id: string;
  shaderId: string;
  textureType: string;
  material: NodeMaterialOptions;
  textures?: Record<string, Texture>;
};

export type MaterialData<Data extends object = any> = {
  scene: Scene;
  uniforms?: string[];
  attributes?: string[];
  samplers?: string[];
  defines?: string[];
  data: Data;
  hasEffects?: boolean;
} & NodeMaterialOptions;
