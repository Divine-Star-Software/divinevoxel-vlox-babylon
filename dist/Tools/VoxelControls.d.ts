import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3Like } from "@amodx/math";
import { TypedEventTarget } from "@divinevoxel/vlox/Util/TypedEventTarget";
declare enum Axes {
    X = 0,
    Y = 1,
    Z = 2
}
type AxesNames = "x" | "y" | "z";
declare class PositionAxes {
    controls: VoxelControls;
    normal: Vector3;
    axex: Axes;
    _states: Float32Array;
    mesh: Mesh;
    _dirty: boolean;
    get hover(): boolean;
    set hover(hovver: boolean);
    get active(): boolean;
    set active(active: boolean);
    min: Vector3;
    max: Vector3;
    constructor(controls: VoxelControls, normal: Vector3, axex: Axes, _states: Float32Array);
    deltaPoint: Vector3;
    deltas: Vector3;
    update(ray: Ray, mouseDown: boolean): void;
    dispose(): void;
}
export interface VoxelControlsEvents {
    position: Vector3Like;
    active: AxesNames;
    inactive: AxesNames;
}
export declare class VoxelControls extends TypedEventTarget<VoxelControlsEvents> {
    scene: Scene;
    static Materials: Map<Scene, ShaderMaterial>;
    xAxes: PositionAxes;
    yAxes: PositionAxes;
    zAxes: PositionAxes;
    colors: Record<Axes, Color3>;
    parent: TransformNode;
    material: ShaderMaterial;
    _states: Float32Array;
    _controlActive: boolean;
    origin: Vector3Like;
    size: Vector3Like;
    constructor(scene: Scene);
    updateColors(x: Color3, y: Color3, z: Color3): void;
    setOriginAndSize(origin: Vector3Like, size: Vector3Like): void;
    updatePosition(): void;
    update(mouseDown: boolean, rayOrigin: Vector3Like, rayDirection: Vector3Like, length: number): void;
    setEnabled(enabled: boolean): void;
    dispose(): void;
}
export {};
