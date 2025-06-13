import { Vector3Like } from "@amodx/math";
import { WorldSpaces } from "@divinevoxel/vlox/World/WorldSpaces";
import { GenMapTile } from "./GenMapTile";
const tempPosition = Vector3Like.Create();
const tempPositionArray = [0, 0, 0];
export class GenMapTilesRegister {
    worldMap;
    _dimensions = new Map();
    constructor(worldMap) {
        this.worldMap = worldMap;
        this._dimensions.set(0, {
            sectors: new Map(),
        });
    }
    clearAll() {
        for (const [dkey, dim] of this._dimensions) {
            this.dimensions.remove(dkey);
        }
        this._dimensions.set(0, {
            sectors: new Map(),
        });
    }
    dimensions = {
        add: (id) => {
            const dimesnion = new Map();
            this._dimensions.set(id, {
                sectors: new Map(),
            });
            return dimesnion;
        },
        get: (id) => {
            return this._dimensions.get(id);
        },
        remove: (id) => {
            const dimension = this._dimensions.get(id);
            if (!dimension)
                return false;
            dimension.sectors.forEach((column) => {
                column.dispose();
            });
            this._dimensions.delete(id);
            return true;
        },
    };
    sectors = {
        add: (dimensionId, x, y, z) => {
            const dimension = this.dimensions.get(dimensionId);
            const tile = GenMapTile.Pool.length
                ? GenMapTile.Pool.shift()
                : new GenMapTile(this.worldMap);
            tile.set(dimensionId, ...WorldSpaces.sector.getPositionVec3Array(x, y, z, tempPositionArray));
            tile._dispoed = false;
            dimension.sectors.set(WorldSpaces.hash.hashVec3Array(tile.position), tile);
            return tile;
        },
        remove: (dimensionId, x, y, z) => {
            const dimension = this.dimensions.get(dimensionId);
            const sectorKey = WorldSpaces.hash.hashVec3(WorldSpaces.sector.getPosition(x, y, z, tempPosition));
            const sector = dimension.sectors.get(sectorKey);
            if (!sector)
                return false;
            sector.dispose();
            dimension.sectors.delete(sectorKey);
            return sector;
        },
        get: (dimensionId, x, y, z) => {
            const dimension = this.dimensions.get(dimensionId);
            if (!dimension)
                return false;
            return dimension.sectors.get(WorldSpaces.hash.hashVec3(WorldSpaces.sector.getPosition(x, y, z, tempPosition)));
        },
    };
}
