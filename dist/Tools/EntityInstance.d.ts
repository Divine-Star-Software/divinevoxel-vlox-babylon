import { EntityTool } from "./EntityTool.js";
import { Matrix } from "@babylonjs/core/Maths/math.vector.js";
export declare class EntityInstance {
    readonly index: number;
    readonly _tool: EntityTool;
    constructor(index: number, _tool: EntityTool);
    updateMatrix(matrix: Matrix): void;
    setPosition(x: number, y: number, z: number): void;
    destroy(): void;
}
