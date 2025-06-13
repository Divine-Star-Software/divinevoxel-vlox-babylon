import { Matrix } from "@babylonjs/core/Maths/math.vector.js";
import { EntityInstance } from "./EntityInstance.js";
import "@babylonjs/core/Meshes/thinInstanceMesh";
const identity = Matrix.Identity();
export class EntityTool {
    mesh;
    _instanceAmount = 0;
    _positionArray;
    _rotationArray;
    _scaleArray;
    _matrixArray;
    _instances = [];
    _usedInstances = new Set();
    _bufferIds = [];
    constructor(mesh) {
        this.mesh = mesh;
    }
    addBuffer(id, buffer, stride) {
        this.mesh.thinInstanceSetBuffer(id, buffer, stride, false);
        this._bufferIds.push(id);
    }
    setInstanceAmount(amount) {
        this._matrixArray = new Float32Array(amount * 16);
        this._positionArray = new Float32Array(amount * 3);
        this._rotationArray = new Float32Array(amount * 3);
        this._scaleArray = new Float32Array(amount * 3);
        this.addBuffer("matrix", this._matrixArray, 16);
        this._instanceAmount = amount;
        let i = this._instanceAmount;
        while (i--) {
            const newInstance = new EntityInstance(i, this);
            this._instances.push(newInstance);
        }
        this.update();
    }
    getInstance() {
        const instance = this._instances.shift();
        if (!instance)
            return false;
        instance.updateMatrix(identity);
        this._usedInstances.add(instance);
        return instance;
    }
    returnAll() {
        for (const instance of this._usedInstances) {
            this._instances.push(instance);
            this._usedInstances.delete(instance);
        }
        this._usedInstances.clear();
    }
    update() {
        for (let i = 0; i < this._bufferIds.length; i++) {
            this.mesh.thinInstanceBufferUpdated(this._bufferIds[i]);
        }
    }
}
