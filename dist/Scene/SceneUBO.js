import { UniformBuffer } from "@babylonjs/core/Materials/uniformBuffer";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
const tmepColor = new Color3();
export class SceneUBO {
    buffer;
    static Define = /* glsl */ `
  layout(std140) uniform SceneOptions {
      float scene_time;
      vec3 scene_fogColor;
      vec3 scene_skyColor;
      /*
        x -> mode
            0 -> disabled
            1 -> exp. 
            2 -> volumetric
            3 -> animated volumetric
        y -> density 
        z -> height factor
      */
      vec4 scene_fogOptions; 
      /*
        x -> shadeMode
            0 -> enabled
            1 -> disabled
        y -> fog start
        z -> fog end
      */
      vec4 scene_fogShadeOptions; 
      /*
        x -> sky horizon
        y -> sky horizon start
        z -> sky horizon end
      */
      vec4 scene_skyOptions;
      /*
        x -> sky blend start
        y -> sky blend end
      */
        vec4 scene_skyShadeOptions;
      /*
        x -> doSun
        y -> doRGB
        z -> doAO
        w -> doColors
      */
      vec4 scene_shadeOptions;
      /*
        x -> enabled
      */
      vec4 scene_effectOptions;
      /*
        x -> baseLightLevel
        y -> sunLevel
      */
      vec4 scene_levels;
  };
`;
    static Create(scene) {
        const buffer = new UniformBuffer(scene.getEngine());
        buffer.addUniform("scene_time", 1);
        buffer.addUniform("scene_fogColor", 3);
        buffer.addUniform("scene_skyColor", 3);
        buffer.addUniform("scene_fogOptions", 4);
        buffer.addUniform("scene_fogShadeOptions", 4);
        buffer.addUniform("scene_skyOptions", 4);
        buffer.addUniform("scene_skyShadeOptions", 4);
        buffer.addUniform("scene_shadeOptions", 4);
        buffer.addUniform("scene_effectOptions", 4);
        buffer.addUniform("scene_levels", 4);
        return buffer;
    }
    fogColor = new Color3();
    skyColor = new Color3();
    fogOptions = new Vector4();
    fogShadeOptions = new Vector4();
    skyOptions = new Vector4();
    skyShadeOptions = new Vector4();
    shadeOptions = new Vector4();
    effectOptions = new Vector4();
    levels = new Vector4();
    _isDirty = false;
    constructor(buffer) {
        this.buffer = buffer;
    }
    setSkyColor(x, y, z) {
        if (x instanceof Color3) {
            this.skyColor.copyFrom(x);
        }
        else {
            this.skyColor.set(x, y, z);
        }
        this._isDirty = true;
        tmepColor.copyFrom(this.skyColor);
        if (tmepColor.r > 1)
            tmepColor.r /= 255;
        if (tmepColor.g > 1)
            tmepColor.g /= 255;
        if (tmepColor.b > 1)
            tmepColor.b /= 255;
        this.buffer.updateColor3("scene_skyColor", tmepColor);
    }
    setSkyOptions(x, y, z, w) {
        if (x instanceof Vector4) {
            this.skyOptions.copyFrom(x);
        }
        else {
            this.skyOptions.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_skyOptions", this.skyOptions);
    }
    setSkyShadeOptions(x, y, z, w) {
        if (x instanceof Vector4) {
            this.skyShadeOptions.copyFrom(x);
        }
        else {
            this.skyShadeOptions.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_skyShadeOptions", this.skyShadeOptions);
    }
    setFogColor(x, y, z) {
        if (x instanceof Color3) {
            this.fogColor.copyFrom(x);
        }
        else {
            this.fogColor.set(x, y, z);
        }
        this._isDirty = true;
        tmepColor.copyFrom(this.fogColor);
        if (tmepColor.r > 1)
            tmepColor.r /= 255;
        if (tmepColor.g > 1)
            tmepColor.g /= 255;
        if (tmepColor.b > 1)
            tmepColor.b /= 255;
        this.buffer.updateColor3("scene_fogColor", tmepColor);
    }
    setFogOptions(x, y, z, w) {
        if (x instanceof Vector4) {
            this.fogOptions.copyFrom(x);
        }
        else {
            this.fogOptions.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_fogOptions", this.fogOptions);
    }
    setFogShadeOptions(x, y, z, w) {
        if (x instanceof Vector4) {
            this.fogShadeOptions.copyFrom(x);
        }
        else {
            this.fogShadeOptions.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_fogShadeOptions", this.fogShadeOptions);
    }
    setShadeOptions(x, y, z, w) {
        if (x instanceof Vector4) {
            this.shadeOptions.copyFrom(x);
        }
        else {
            this.shadeOptions.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_shadeOptions", this.shadeOptions);
    }
    setEffectOptions(x, y, z, w) {
        if (x instanceof Vector4) {
            this.effectOptions.copyFrom(x);
        }
        else {
            this.effectOptions.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_effectOptions", this.effectOptions);
    }
    setLevels(x, y, z, w) {
        if (x instanceof Vector4) {
            this.levels.copyFrom(x);
        }
        else {
            this.levels.set(x, y, z, w);
        }
        this._isDirty = true;
        this.buffer.updateVector4("scene_levels", this.levels);
    }
    updateTime(time) {
        this._isDirty = true;
        this.buffer.updateFloat("scene_time", time);
    }
    clone(scene) {
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
    update() {
        if (!this._isDirty)
            return;
        this.buffer.update();
        this._isDirty = false;
    }
}
