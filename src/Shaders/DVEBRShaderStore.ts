import { Effect } from "@babylonjs/core/Materials/effect.js";
import { PBRShaderData, ShaderStoreData } from "./Shader.types";
type shaderTypes = "vertex" | "frag";
Effect.LogShaderCodeOnCompilationError = false;
export class DVEBRShaderStore {
  getShader(id: string, type: shaderTypes): string | null {
    const code =
      Effect.ShadersStore[
        `${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`
      ];
    if (!code) return null;
    return code;
  }
  storeShader(id: string, type: shaderTypes, shader: string): void {
    Effect.ShadersStore[
      `${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`
    ] = shader;
  }
  static getShader(id: string, type: shaderTypes): string | null {
    const code =
      Effect.ShadersStore[
        `${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`
      ];
    if (!code) return null;
    return code;
  }
  static storeShader(id: string, type: shaderTypes, shader: string): void {
    Effect.ShadersStore[
      `${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`
    ] = shader;
  }
  static _shaderData = new Map<string, ShaderStoreData>();

  static setShaderData(
    id: string,
    uniforms: string[],
    attributes: string[],
    samplers: string[] = [],
    pbr: PBRShaderData | null = null,
  ) {
    this._shaderData.set(id, { uniforms, attributes, samplers, pbr });
  }
  static getShaderData(id: string) {
    return this._shaderData.get(id);
  }
}
