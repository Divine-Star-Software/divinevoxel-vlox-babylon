import { EntityTool } from "./EntityTool.js";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector.js";

const tempMatrix = new Matrix();
const translation = new Vector3();
const scale = new Vector3();
const quaternion = new Quaternion();
const scaledPivot = new Vector3();
const rotatedScaledPivot = new Vector3();

export class EntityInstance {
  constructor(
    public readonly index: number,
    public readonly _tool: EntityTool,
  ) {}

  setVisible(visible: boolean) {
    this._tool._visibleArray[this.index] = visible ? 1 : 0;
    this.syncMatrix();
  }

  private syncMatrix() {
    const dataIndex = this.index * 3;

    const posX = this._tool._positionArray[dataIndex];
    const posY = this._tool._positionArray[dataIndex + 1];
    const posZ = this._tool._positionArray[dataIndex + 2];

    let scaleX = this._tool._scaleArray[dataIndex];
    let scaleY = this._tool._scaleArray[dataIndex + 1];
    let scaleZ = this._tool._scaleArray[dataIndex + 2];
    if (!this._tool._visibleArray[this.index]) {
      scaleX = 0;
      scaleY = 0;
      scaleZ = 0;
    }
    scale.set(scaleX, scaleY, scaleZ);

    const rotX = this._tool._rotationArray[dataIndex];
    const rotY = this._tool._rotationArray[dataIndex + 1];
    const rotZ = this._tool._rotationArray[dataIndex + 2];
    Quaternion.RotationYawPitchRollToRef(rotY, rotX, rotZ, quaternion);

    const pivotX = this._tool._pivotArray[dataIndex];
    const pivotY = this._tool._pivotArray[dataIndex + 1];
    const pivotZ = this._tool._pivotArray[dataIndex + 2];

    scaledPivot.set(pivotX * scaleX, pivotY * scaleY, pivotZ * scaleZ);
    scaledPivot.rotateByQuaternionToRef(quaternion, rotatedScaledPivot);

    translation.set(
      posX + pivotX - rotatedScaledPivot.x,
      posY + pivotY - rotatedScaledPivot.y,
      posZ + pivotZ - rotatedScaledPivot.z
    );

    Matrix.ComposeToRef(scale, quaternion, translation, tempMatrix);

    const trueIndex = this.index * 16;
    for (let i = 0; i < 16; i++) {
      this._tool._matrixArray[trueIndex + i] = tempMatrix.m[i];
    }
  }

  setPosition(x: number, y: number, z: number) {
    const idx = this.index * 3;
    this._tool._positionArray[idx] = x;
    this._tool._positionArray[idx + 1] = y;
    this._tool._positionArray[idx + 2] = z;
    this.syncMatrix();
  }

  setRotation(x: number, y: number, z: number) {
    const idx = this.index * 3;
    this._tool._rotationArray[idx] = x;
    this._tool._rotationArray[idx + 1] = y;
    this._tool._rotationArray[idx + 2] = z;
    this.syncMatrix();
  }

  setPivot(x: number, y: number, z: number, sync = false) {
    const idx = this.index * 3;
    this._tool._pivotArray[idx] = x;
    this._tool._pivotArray[idx + 1] = y;
    this._tool._pivotArray[idx + 2] = z;
   if(sync) this.syncMatrix();
  }

  setData(
    positionX: number, positionY: number, positionZ: number,
    scaleX: number, scaleY: number, scaleZ: number,
    rotationX: number, rotationY: number, rotationZ: number,
  ) {
    const idx = this.index * 3;

    this._tool._positionArray[idx] = positionX;
    this._tool._positionArray[idx + 1] = positionY;
    this._tool._positionArray[idx + 2] = positionZ;

    this._tool._scaleArray[idx] = scaleX;
    this._tool._scaleArray[idx + 1] = scaleY;
    this._tool._scaleArray[idx + 2] = scaleZ;

    this._tool._rotationArray[idx] = rotationX;
    this._tool._rotationArray[idx + 1] = rotationY;
    this._tool._rotationArray[idx + 2] = rotationZ;

    this.syncMatrix();
  }

  destroy() {
    const trueIndex = this.index * 16;
    for (let i = trueIndex; i < trueIndex + 16; i++) {
      this._tool._matrixArray[i] = 0;
    }
    this._tool._instances.push(this);
    this._tool._usedInstances.delete(this);
  }
}