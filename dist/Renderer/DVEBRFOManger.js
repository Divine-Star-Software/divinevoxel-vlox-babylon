import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
export class DVEBRFOManager {
    activeCamera = null;
    activeNode = null;
    onOriginSet = [];
    node;
    registerOnOriginSet(run) {
        this.onOriginSet.push(run);
    }
    getActiveNode() {
        if (!this.activeNode)
            return null;
        if (!this.node)
            this.node = this.activeNode;
        return this.node;
    }
    setOriginCenter(scene, object) {
        this.activeNode = new TransformNode("", scene);
        this.onOriginSet.forEach((_) => _(this.activeCamera));
        const doublepos = new Vector3();
        scene.onBeforeActiveMeshesEvaluationObservable.add(() => {
            this.activeNode.position = doublepos.subtract(object.position);
        });
    }
}
