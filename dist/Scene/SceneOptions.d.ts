import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { SceneUBO } from "./SceneUBO";
declare class UBOColor3 {
    private _color;
    private ubo;
    private propertyId;
    constructor(_color: Color3, ubo: SceneUBO, propertyId: string);
    _update(): void;
    get r(): number;
    set r(value: number);
    get g(): number;
    set g(value: number);
    get b(): number;
    set b(value: number);
    set(r: number, g: number, b: number): void;
    clone(newColor3: Color3, ubo: SceneUBO): UBOColor3;
}
declare class ShadeOptions {
    private _options;
    get doSun(): boolean;
    set doSun(value: boolean);
    get doRGB(): boolean;
    set doRGB(value: boolean);
    get doAO(): boolean;
    set doAO(value: boolean);
    get doColor(): boolean;
    set doColor(value: boolean);
    constructor(_options: SceneOptions);
}
declare class EffectOptions {
    private _options;
    get enabled(): boolean;
    set enabled(value: boolean);
    constructor(_options: SceneOptions);
}
declare class LevelOptions {
    private _options;
    get baseLevel(): number;
    set baseLevel(value: number);
    get sunLevel(): number;
    set sunLevel(value: number);
    constructor(_options: SceneOptions);
}
declare class SkyOptions {
    private _options;
    color: UBOColor3;
    get horizon(): number;
    set horizon(value: number);
    get horizonStart(): number;
    set horizonStart(value: number);
    get horizonEnd(): number;
    set horizonEnd(value: number);
    get startBlend(): number;
    set startBlend(value: number);
    get endBlend(): number;
    set endBlend(value: number);
    constructor(_options: SceneOptions);
    getColor(): Color3;
    setColor(r: number, g: number, b: number): void;
}
declare enum FogModes {
    None = 0,
    Exp = 1,
    Volumetric = 2,
    AnimatedVolumetric = 3
}
declare class FogOptions {
    _options: SceneOptions;
    readonly Modes: typeof FogModes;
    color: UBOColor3;
    get mode(): FogModes;
    set mode(mode: FogModes);
    get density(): number;
    set density(value: number);
    get heightFactor(): number;
    set heightFactor(value: number);
    get start(): number;
    set start(value: number);
    get end(): number;
    set end(value: number);
    get skyShade(): boolean;
    set skyShade(value: boolean);
    constructor(_options: SceneOptions);
    getColor(): Color3;
    setColor(r: number, g: number, b: number): void;
}
export declare class SceneOptions {
    scene: Scene;
    shade: ShadeOptions;
    levels: LevelOptions;
    sky: SkyOptions;
    fog: FogOptions;
    effects: EffectOptions;
    ubo: SceneUBO;
    constructor(scene: Scene, postponeUBOCreation?: boolean);
    clone(scene: Scene): SceneOptions;
}
export {};
