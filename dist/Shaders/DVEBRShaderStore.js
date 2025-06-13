import { Effect } from "@babylonjs/core/Materials/effect.js";
export class DVEBRShaderStore {
    getShader(id, type) {
        const code = Effect.ShadersStore[`${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`];
        if (!code)
            return null;
        return code;
    }
    storeShader(id, type, shader) {
        Effect.ShadersStore[`${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`] = shader;
    }
    static getShader(id, type) {
        const code = Effect.ShadersStore[`${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`];
        if (!code)
            return null;
        return code;
    }
    static storeShader(id, type, shader) {
        Effect.ShadersStore[`${id}${type == "vertex" ? "VertexShader" : "FragmentShader"}`] = shader;
    }
    static _shaderData = new Map();
    static setShaderData(id, uniforms, attributes) {
        this._shaderData.set(id, { uniforms, attributes });
    }
    static getShaderData(id) {
        return this._shaderData.get(id);
    }
}
