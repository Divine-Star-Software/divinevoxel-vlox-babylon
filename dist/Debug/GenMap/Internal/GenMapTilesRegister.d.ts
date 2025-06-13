import { LocationData } from "@divinevoxel/vlox/Math";
import { GenMapTile } from "./GenMapTile";
import { GenMap } from "./GenMap";
export type WorldMapTilesRegisterColumn = {
    location: LocationData;
    tile: GenMapTile;
};
export type WorldMapTileRegisterDimensions = {
    sectors: Map<string, GenMapTile>;
};
export declare class GenMapTilesRegister {
    worldMap: GenMap;
    _dimensions: Map<number, WorldMapTileRegisterDimensions>;
    constructor(worldMap: GenMap);
    clearAll(): void;
    dimensions: {
        add: (id: number) => Map<any, any>;
        get: (id: number) => WorldMapTileRegisterDimensions | undefined;
        remove: (id: number) => boolean;
    };
    sectors: {
        add: (dimensionId: number, x: number, y: number, z: number) => GenMapTile;
        remove: (dimensionId: number, x: number, y: number, z: number) => false | GenMapTile;
        get: (dimensionId: number, x: number, y: number, z: number) => false | GenMapTile | undefined;
    };
}
