import { Vec3Array } from "@amodx/math";

export type PBRShaderUpdateData = Record<string, string>;

export type PBRShaderData = {
  vertexUpdates: PBRShaderUpdateData;
  fragmentUpdates: PBRShaderUpdateData;
};

export type ShaderStoreData = {
  uniforms: string[];
  attributes: string[];
  samplers: string[];
  pbr: PBRShaderData | null;
};
