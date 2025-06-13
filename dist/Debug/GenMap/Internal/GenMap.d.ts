import { GenMapTilesRegister } from "./GenMapTilesRegister";
import { EntityTool } from "../../../Tools/EntityTool";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { LocationData } from "@divinevoxel/vlox/Math";
import { Vector3Like } from "@amodx/math";
export declare class GenMap {
    static Constants: {
        MAX_TILES: number;
    };
    tilesRegister: GenMapTilesRegister;
    tilesMaterial: ShaderMaterial;
    _colorBuffer: Float32Array;
    _instanceTool: EntityTool;
    _instanceMesh: Mesh;
    _previousLocation: LocationData;
    _searchQueue: number[];
    _lastPosition: Vector3Like;
    _visitedMap: Map<string, boolean>;
    constructor();
    init(scene: Scene): void;
    updateTiles(location: LocationData): void;
    dispose(): void;
}
