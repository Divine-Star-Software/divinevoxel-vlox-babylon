import type { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
export declare class DVEBRFOManager {
    activeCamera: TransformNode | null;
    activeNode: TransformNode | null;
    onOriginSet: Function[];
    node: TransformNode;
    registerOnOriginSet(run: (node: TransformNode) => void): void;
    getActiveNode(): TransformNode | null;
    setOriginCenter(scene: Scene, object: {
        position: Vector3;
    }): void;
}
