import { GenMap } from "./GenMap";
import { EntityInstance } from "../../../Tools/EntityInstance";
import { Sector } from "@divinevoxel/vlox/World";
import { Vec3Array } from "@amodx/math";
export declare class GenMapTile {
    worldMap: GenMap;
    static Tiles: GenMapTile[];
    static Pool: GenMapTile[];
    _instance: EntityInstance;
    _dispoed: boolean;
    _sector: Sector | null;
    dimensonId: number;
    position: Vec3Array;
    constructor(worldMap: GenMap);
    set(dimensonId: number, x: number, y: number, z: number): void;
    update(): void;
    setColor(r: number, g: number, b: number, a?: number): void;
    dispose(): void;
}
