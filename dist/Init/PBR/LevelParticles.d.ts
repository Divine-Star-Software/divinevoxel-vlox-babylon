import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { GPUParticleSystem } from "@babylonjs/core/Particles/gpuParticleSystem";
import "@babylonjs/core/Particles/webgl2ParticleSystem";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
export declare class LevelParticles {
    static particle: ParticleSystem | GPUParticleSystem;
    static emitter: Mesh;
    static activeParticles: ParticleSystem | GPUParticleSystem;
    static texture: Texture;
    static scene: Scene;
    static init(scene: Scene): void;
    static _getParticleSystem(): ParticleSystem | GPUParticleSystem;
    static start(color1: Color4, color2?: Color4, colorDead?: Color4): void;
    static stop(): void;
}
