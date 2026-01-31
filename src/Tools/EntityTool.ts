import { Matrix } from "@babylonjs/core/Maths/math.vector.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { EntityInstance } from "./EntityInstance.js";
import "@babylonjs/core/Meshes/thinInstanceMesh";
export class EntityTool {
  _instanceAmount = 0;
  _visibleArray: Uint8Array;
  _positionArray: Float32Array;
  _rotationArray: Float32Array;
  _pivotArray: Float32Array;
  _scaleArray: Float32Array;
  _matrixArray: Float32Array;
  _instances: EntityInstance[] = [];
  _usedInstances = new Set<EntityInstance>();
  _bufferIds: string[] = [];
  constructor(public mesh: Mesh) {}

  addBuffer(id: string, buffer: Float32Array, stride?: number) {
    this.mesh.thinInstanceSetBuffer(id, buffer, stride, false);
    this._bufferIds.push(id);
  }

  setInstanceAmount(amount: number) {
    this._matrixArray = new Float32Array(amount * 16);
    this._visibleArray = new Uint8Array(amount);
    this._positionArray = new Float32Array(amount * 3);
    this._pivotArray = new Float32Array(amount * 3);
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
    if (!instance) return false;
    this._visibleArray[instance.index] = 1;
    instance.setData(0, 0, 0, 1, 1, 1, 0, 0, 0);
    this._usedInstances.add(instance);
    return instance;
  }

  returnAll() {
    for (const instance of this._usedInstances) {
      this._visibleArray[instance.index] = 0;
      const trueIndex = instance.index * 16;
      for (let i = trueIndex; i < trueIndex + 16; i++) {
        this._matrixArray[i] = 0;
      }
      this._instances.push(instance);
    }
    this._usedInstances.clear(); 
  }

  update() {
    for (let i = 0; i < this._bufferIds.length; i++) {
      this.mesh.thinInstanceBufferUpdated(this._bufferIds[i]);
    }
  }
}
