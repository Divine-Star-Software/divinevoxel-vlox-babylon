import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SceneUBO } from "./SceneUBO";
const tmepColor = new Color3();
class UBOColor3 {
    _color;
    ubo;
    propertyId;
    constructor(_color, ubo, propertyId) {
        this._color = _color;
        this.ubo = ubo;
        this.propertyId = propertyId;
    }
    _update() {
        this.ubo._isDirty = true;
        tmepColor.copyFrom(this._color);
        if (tmepColor.r > 1)
            tmepColor.r /= 255;
        if (tmepColor.g > 1)
            tmepColor.g /= 255;
        if (tmepColor.b > 1)
            tmepColor.b /= 255;
        this.ubo.buffer.updateColor3(this.propertyId, tmepColor);
    }
    get r() {
        return this._color.r;
    }
    set r(value) {
        const old = this._color.r;
        this._color.r = value;
        if (value != old) {
            this._update();
        }
    }
    get g() {
        return this._color.g;
    }
    set g(value) {
        const old = this._color.g;
        this._color.g = value;
        if (value != old) {
            this._update();
        }
    }
    get b() {
        return this._color.b;
    }
    set b(value) {
        const old = this._color.b;
        this._color.b = value;
        if (value != old) {
            this._update();
        }
    }
    set(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    clone(newColor3, ubo) {
        return new UBOColor3(newColor3, ubo, this.propertyId);
    }
}
class ShadeOptions {
    _options;
    get doSun() {
        return this._options.ubo.shadeOptions.x == 1;
    }
    set doSun(value) {
        this._options.ubo.shadeOptions.x = value ? 1 : 0;
        this._options.ubo.setShadeOptions(this._options.ubo.shadeOptions);
    }
    get doRGB() {
        return this._options.ubo.shadeOptions.y == 1;
    }
    set doRGB(value) {
        this._options.ubo.shadeOptions.y = value ? 1 : 0;
        this._options.ubo.setShadeOptions(this._options.ubo.shadeOptions);
    }
    get doAO() {
        return this._options.ubo.shadeOptions.z == 1;
    }
    set doAO(value) {
        this._options.ubo.shadeOptions.z = value ? 1 : 0;
        this._options.ubo.setShadeOptions(this._options.ubo.shadeOptions);
    }
    get doColor() {
        return this._options.ubo.shadeOptions.w == 1;
    }
    set doColor(value) {
        this._options.ubo.shadeOptions.w = value ? 1 : 0;
        this._options.ubo.setShadeOptions(this._options.ubo.shadeOptions);
    }
    constructor(_options) {
        this._options = _options;
    }
}
class EffectOptions {
    _options;
    get enabled() {
        return this._options.ubo.effectOptions.x == 1;
    }
    set enabled(value) {
        this._options.ubo.effectOptions.x = value ? 1 : 0;
        this._options.ubo.setEffectOptions(this._options.ubo.effectOptions);
    }
    constructor(_options) {
        this._options = _options;
    }
}
class LevelOptions {
    _options;
    get baseLevel() {
        return this._options.ubo.levels.x;
    }
    set baseLevel(value) {
        this._options.ubo.levels.x = value;
        this._options.ubo.setLevels(this._options.ubo.levels);
    }
    get sunLevel() {
        return this._options.ubo.levels.y;
    }
    set sunLevel(value) {
        this._options.ubo.levels.y = value;
        this._options.ubo.setLevels(this._options.ubo.levels);
    }
    constructor(_options) {
        this._options = _options;
    }
}
class SkyOptions {
    _options;
    color;
    get horizon() {
        return this._options.ubo.skyOptions.x;
    }
    set horizon(value) {
        this._options.ubo.skyOptions.x = value;
        this._options.ubo.setSkyOptions(this._options.ubo.skyOptions);
    }
    get horizonStart() {
        return this._options.ubo.skyOptions.y;
    }
    set horizonStart(value) {
        this._options.ubo.skyOptions.y = value;
        this._options.ubo.setSkyOptions(this._options.ubo.skyOptions);
    }
    get horizonEnd() {
        return this._options.ubo.skyOptions.z;
    }
    set horizonEnd(value) {
        this._options.ubo.skyOptions.z = value;
        this._options.ubo.setSkyOptions(this._options.ubo.skyOptions);
    }
    get startBlend() {
        return this._options.ubo.skyShadeOptions.x;
    }
    set startBlend(value) {
        this._options.ubo.skyShadeOptions.x = value;
        this._options.ubo.setSkyShadeOptions(this._options.ubo.skyShadeOptions);
    }
    get endBlend() {
        return this._options.ubo.skyShadeOptions.y;
    }
    set endBlend(value) {
        this._options.ubo.skyShadeOptions.y = value;
        this._options.ubo.setSkyShadeOptions(this._options.ubo.skyShadeOptions);
    }
    constructor(_options) {
        this._options = _options;
        if (this._options.ubo) {
            this.color = new UBOColor3(this._options.ubo.skyColor, this._options.ubo, "scene_skyColor");
        }
    }
    getColor() {
        return this._options.ubo.skyColor;
    }
    setColor(r, g, b) {
        this._options.ubo.skyColor.set(r, g, b);
        this._options.ubo.setSkyColor(this._options.ubo.skyColor);
    }
}
var FogModes;
(function (FogModes) {
    FogModes[FogModes["None"] = 0] = "None";
    FogModes[FogModes["Exp"] = 1] = "Exp";
    FogModes[FogModes["Volumetric"] = 2] = "Volumetric";
    FogModes[FogModes["AnimatedVolumetric"] = 3] = "AnimatedVolumetric";
})(FogModes || (FogModes = {}));
class FogOptions {
    _options;
    Modes = FogModes;
    color;
    get mode() {
        return this._options.ubo.fogOptions.x;
    }
    set mode(mode) {
        this._options.ubo.fogOptions.x = mode;
        this._options.ubo.setFogOptions(this._options.ubo.fogOptions);
    }
    get density() {
        return this._options.ubo.fogOptions.y;
    }
    set density(value) {
        this._options.ubo.fogOptions.y = value;
        this._options.ubo.setFogOptions(this._options.ubo.fogOptions);
    }
    get heightFactor() {
        return this._options.ubo.fogOptions.z;
    }
    set heightFactor(value) {
        this._options.ubo.fogOptions.z = value;
        this._options.ubo.setFogOptions(this._options.ubo.fogOptions);
    }
    get start() {
        return this._options.ubo.fogOptions.y;
    }
    set start(value) {
        this._options.ubo.fogOptions.y = value;
        this._options.ubo.setFogShadeOptions(this._options.ubo.fogOptions);
    }
    get end() {
        return this._options.ubo.fogOptions.z;
    }
    set end(value) {
        this._options.ubo.fogOptions.z = value;
        this._options.ubo.setFogShadeOptions(this._options.ubo.fogOptions);
    }
    get skyShade() {
        return this._options.ubo.fogShadeOptions.x == 1;
    }
    set skyShade(value) {
        this._options.ubo.fogShadeOptions.x = value ? 1 : 0;
        this._options.ubo.setFogShadeOptions(this._options.ubo.fogShadeOptions);
    }
    constructor(_options) {
        this._options = _options;
        if (this._options.ubo) {
            this.color = new UBOColor3(this._options.ubo.fogColor, this._options.ubo, "scene_fogColor");
        }
    }
    getColor() {
        return this._options.ubo.fogColor;
    }
    setColor(r, g, b) {
        this._options.ubo.fogColor.set(r, g, b);
        this._options.ubo.setFogColor(this._options.ubo.fogColor);
    }
}
export class SceneOptions {
    scene;
    shade;
    levels;
    sky;
    fog;
    effects;
    ubo;
    constructor(scene, postponeUBOCreation = false) {
        this.scene = scene;
        if (!postponeUBOCreation) {
            this.ubo = new SceneUBO(SceneUBO.Create(scene));
        }
        this.shade = new ShadeOptions(this);
        this.levels = new LevelOptions(this);
        this.sky = new SkyOptions(this);
        this.fog = new FogOptions(this);
        this.effects = new EffectOptions(this);
    }
    clone(scene) {
        const newOptions = new SceneOptions(scene, true);
        newOptions.ubo = this.ubo.clone(scene);
        newOptions.sky.color = this.sky.color.clone(newOptions.ubo.skyColor, newOptions.ubo);
        newOptions.fog.color = this.fog.color.clone(newOptions.ubo.fogColor, newOptions.ubo);
        return newOptions;
    }
}
