import { Scene } from "@babylonjs/core/scene";
import { UniformBuffer } from "@babylonjs/core/Materials/uniformBuffer";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Observable } from "@babylonjs/core/Misc/observable";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial.js";

export class SceneUBO {
  static UniformBufferSuppourted = true;
  static get BaseDefine() {
    let shader = "";
    for (const [key, value] of SceneUBO.DefaultUniforms) {
      let start = "";
      if (typeof value == "number") {
        start = "float";
      }
      if (value instanceof Color3) {
        start = "vec3";
      }
      if (value instanceof Vector3) {
        start = "vec3";
      }
      if (value instanceof Vector4) {
        start = "vec4";
      }
      shader += `uniform ${start} ${key};\n`;
    }
    return shader;
  }
  static get Define() {
    let shader = "";
    for (const [key, value] of SceneUBO.DefaultUniforms) {
      let start = "";
      if (typeof value == "number") {
        start = "float";
      }
      if (value instanceof Color3) {
        start = "vec3";
      }
      if (value instanceof Vector3) {
        start = "vec3";
      }
      if (value instanceof Vector4) {
        start = "vec4";
      }
      shader += `${start} ${key};\n`;
    }
    return /* glsl */ `
  layout(std140) uniform SceneOptions {
      ${shader}
  };
`;
  }
  static DefaultUniforms = new Map<string, number | Color3 | Vector3 | Vector4>(
    [
      ["scene_time", 0],
      ["scene_fogColor", new Color3()],
      ["scene_skyColor", new Color3()],
      ["scene_fogOptions", new Vector4()],
      ["scene_fogShadeOptions", new Vector4()],
      ["scene_skyOptions", new Vector4()],
      ["scene_skyShadeOptions", new Vector4()],
      ["scene_shadeOptions", new Vector4()],
      ["scene_effectOptions", new Vector4()],
      ["scene_levels", new Vector4()],
    ]
  );
  static Create(scene: Scene) {
    if (!SceneUBO.UniformBufferSuppourted) return null;
    const buffer = new UniformBuffer(scene.getEngine());
    for (const [id, value] of this.DefaultUniforms) {
      if (typeof value == "number") {
        buffer.addUniform(id, 1);
      }
      if (value instanceof Color3) {
        buffer.addUniform(id, 3);
      }
      if (value instanceof Vector3) {
        buffer.addUniform(id, 4);
      }
      if (value instanceof Vector4) {
        buffer.addUniform(id, 4);
      }
    }
    return buffer;
  }

  observers = {
    beforeSync: new Observable(),
  };
  uniforms = new Map<string, number | Color3 | Vector3 | Vector4>();
  dirtyUniforms = new Map<string, boolean>();
  fogColor: Color3;
  skyColor: Color3;
  /** 
        x -> mode
            0 -> disabled
            1 -> exp. 
            2 -> volumetric
            3 -> animated volumetric
        y -> density 
        z -> height factor
      */
  fogOptions: Vector4;
  /** 
        x -> shadeMode
            0 -> enabled
            1 -> disabled
        y -> fog start
        z -> fog end
      */
  fogShadeOptions: Vector4;
  /** 
        x -> sky horizon
        y -> sky horizon start
        z -> sky horizon end
      */
  skyOptions: Vector4;
  /** 
        x -> sky blend start
        y -> sky blend end
      */
  skyShadeOptions: Vector4;
  /** 
        x -> doSun
        y -> doRGB
        z -> doAO
        w -> doColors
      */
  shadeOptions: Vector4;
  /** 
        x -> enabled
      */
  effectOptions: Vector4;
  /** 
        x -> baseLightLevel
        y -> sunLevel
      */
  levels = new Vector4();
  _isDirty = false;
  get suppourtsUBO() {
    return SceneUBO.UniformBufferSuppourted;
  }
  get allUniformsNames() {
    return [...SceneUBO.DefaultUniforms.keys()];
  }

  constructor(public buffer: UniformBuffer | null = null) {
    for (const [key, value] of SceneUBO.DefaultUniforms) {
      this.dirtyUniforms.set(key, false);
      this.uniforms.set(key, typeof value == "number" ? value : value.clone());
    }
    this.fogColor = this.uniforms.get("scene_fogColor") as any;
    this.skyColor = this.uniforms.get("scene_skyColor") as any;
    this.fogOptions = this.uniforms.get("scene_fogOptions") as any;
    this.fogShadeOptions = this.uniforms.get("scene_fogShadeOptions") as any;
    this.skyOptions = this.uniforms.get("scene_skyOptions") as any;
    this.skyShadeOptions = this.uniforms.get("scene_skyShadeOptions") as any;
    this.shadeOptions = this.uniforms.get("scene_shadeOptions") as any;
    this.effectOptions = this.uniforms.get("scene_effectOptions") as any;
    this.levels = this.uniforms.get("scene_levels") as any;
  }

  _clearDirtyUniforms() {
    for (const [key] of this.dirtyUniforms) {
      this.dirtyUniforms.set(key, false);
    }
  }

  setSkyColor(r: number, g: number, b: number): void;
  setSkyColor(color: Color3): void;
  setSkyColor(x: number | Color3, y?: number, z?: number): void {
    if (x instanceof Color3) {
      this.skyColor.copyFrom(x);
    } else {
      this.skyColor.set(x, y!, z!);
    }
    this.dirtyUniforms.set("scene_skyColor", true);
    this._isDirty = true;

    if (this.skyColor.r > 1) this.skyColor.r /= 255;
    if (this.skyColor.g > 1) this.skyColor.g /= 255;
    if (this.skyColor.b > 1) this.skyColor.b /= 255;

    if (this.buffer) this.buffer.updateColor3("scene_skyColor", this.skyColor);
  }

  setSkyOptions(x: number, y: number, z: number, w: number): void;
  setSkyOptions(options: Vector4): void;
  setSkyOptions(x: number | Vector4, y?: number, z?: number, w?: number): void {
    if (x instanceof Vector4) {
      this.skyOptions.copyFrom(x);
    } else {
      this.skyOptions.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_skyOptions", true);
    this._isDirty = true;
    if (this.buffer)
      this.buffer.updateVector4("scene_skyOptions", this.skyOptions);
  }

  setSkyShadeOptions(x: number, y: number, z: number, w: number): void;
  setSkyShadeOptions(options: Vector4): void;
  setSkyShadeOptions(
    x: number | Vector4,
    y?: number,
    z?: number,
    w?: number
  ): void {
    if (x instanceof Vector4) {
      this.skyShadeOptions.copyFrom(x);
    } else {
      this.skyShadeOptions.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_skyShadeOptions", true);
    this._isDirty = true;
    if (this.buffer)
      this.buffer.updateVector4("scene_skyShadeOptions", this.skyShadeOptions);
  }

  setFogColor(r: number, g: number, b: number): void;
  setFogColor(color: Color3): void;
  setFogColor(x: number | Color3, y?: number, z?: number): void {
    if (x instanceof Color3) {
      this.fogColor.copyFrom(x);
    } else {
      this.fogColor.set(x, y!, z!);
    }
    this.dirtyUniforms.set("scene_fogColor", true);
    this._isDirty = true;
    if (this.fogColor.r > 1) this.fogColor.r /= 255;
    if (this.fogColor.g > 1) this.fogColor.g /= 255;
    if (this.fogColor.b > 1) this.fogColor.b /= 255;

    if (this.buffer) this.buffer.updateColor3("scene_fogColor", this.fogColor);
  }

  setFogOptions(x: number, y: number, z: number, w: number): void;
  setFogOptions(options: Vector4): void;
  setFogOptions(x: number | Vector4, y?: number, z?: number, w?: number): void {
    if (x instanceof Vector4) {
      this.fogOptions.copyFrom(x);
    } else {
      this.fogOptions.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_fogOptions", true);
    this._isDirty = true;
    if (this.buffer)
      this.buffer.updateVector4("scene_fogOptions", this.fogOptions);
  }

  setFogShadeOptions(x: number, y: number, z: number, w: number): void;
  setFogShadeOptions(options: Vector4): void;
  setFogShadeOptions(
    x: number | Vector4,
    y?: number,
    z?: number,
    w?: number
  ): void {
    if (x instanceof Vector4) {
      this.fogShadeOptions.copyFrom(x);
    } else {
      this.fogShadeOptions.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_fogShadeOptions", true);
    this._isDirty = true;
    if (this.buffer)
      this.buffer.updateVector4("scene_fogShadeOptions", this.fogShadeOptions);
  }

  setShadeOptions(x: number, y: number, z: number, w: number): void;
  setShadeOptions(options: Vector4): void;
  setShadeOptions(
    x: number | Vector4,
    y?: number,
    z?: number,
    w?: number
  ): void {
    if (x instanceof Vector4) {
      this.shadeOptions.copyFrom(x);
    } else {
      this.shadeOptions.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_shadeOptions", true);
    this._isDirty = true;
    if (this.buffer)
      this.buffer.updateVector4("scene_shadeOptions", this.shadeOptions);
  }

  setEffectOptions(x: number, y: number, z: number, w: number): void;
  setEffectOptions(options: Vector4): void;
  setEffectOptions(
    x: number | Vector4,
    y?: number,
    z?: number,
    w?: number
  ): void {
    if (x instanceof Vector4) {
      this.effectOptions.copyFrom(x);
    } else {
      this.effectOptions.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_effectOptions", true);
    this._isDirty = true;
    if (this.buffer)
      this.buffer.updateVector4("scene_effectOptions", this.effectOptions);
  }

  setLevels(x: number, y: number, z: number, w: number): void;
  setLevels(levels: Vector4): void;
  setLevels(x: number | Vector4, y?: number, z?: number, w?: number): void {
    if (x instanceof Vector4) {
      this.levels.copyFrom(x);
    } else {
      this.levels.set(x, y!, z!, w!);
    }
    this.dirtyUniforms.set("scene_levels", true);
    this._isDirty = true;
    if (this.buffer) this.buffer.updateVector4("scene_levels", this.levels);
  }

  updateTime(time: number): void {
    this._isDirty = true;
    this.uniforms.set("scene_time", time);
    this.dirtyUniforms.set("scene_time", true);
    if (this.buffer) this.buffer.updateFloat("scene_time", time);
  }

  clone(scene: Scene) {
    const buffer = SceneUBO.Create(scene);
    const ubo = new SceneUBO(buffer);

    ubo.setFogColor(this.fogColor);
    ubo.setSkyColor(this.skyColor);
    ubo.setFogOptions(this.fogOptions);
    ubo.setFogShadeOptions(this.fogShadeOptions);
    ubo.setSkyOptions(this.skyOptions);
    ubo.setSkyShadeOptions(this.skyShadeOptions);
    ubo.setLevels(this.levels);
    ubo.setEffectOptions(this.effectOptions);
    ubo.setShadeOptions(this.shadeOptions);
    ubo.updateTime(0);

    return ubo;
  }

  syncToShaderMaterial(force = false, material: ShaderMaterial) {
    if (this.suppourtsUBO) return;
    for (const [key, value] of this.uniforms) {
      if (!force && !this.dirtyUniforms.get(key)) continue;
      if (typeof value == "number") {
        material.setFloat(key, value);
      }
      if (value instanceof Color3) {
        material.setColor3(key, value);
      }
      if (value instanceof Vector3) {
        material.setVector3(key, value);
      }
      if (value instanceof Vector4) {
        material.setVector4(key, value);
      }
    }
  }

  update() {
    if (!this.buffer || !this._isDirty) return;
    this.buffer.update();
    this._isDirty = false;
  }
}
