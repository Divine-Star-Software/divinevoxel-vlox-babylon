import { Vector3Like } from "@amodx/math";
import { DivineVoxelEngineRender } from "@divinevoxel/vlox/Contexts/Render";
export declare class DebugGenMap {
    DVER: DivineVoxelEngineRender;
    private _onDispose;
    constructor(DVER: DivineVoxelEngineRender);
    init(followPosition: Vector3Like, followDirection: Vector3Like, dimension?: number): void;
    dispose(): void;
}
