import { SubMesh } from "@babylonjs/core/Meshes/subMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { BufferAllocation } from "./BufferMesh";
export declare class SubBufferMesh {
    verticesStart: number;
    verticesCount: number;
    indicesStart: number;
    indicesCount: number;
    allocation: BufferAllocation;
    transform: TransformNode;
    mesh: SubMesh;
    private _enabled;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    render(): void;
}
