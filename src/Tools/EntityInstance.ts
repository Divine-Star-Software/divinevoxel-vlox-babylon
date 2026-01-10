import { EntityTool } from "./EntityTool.js";
import {
  Matrix,
  Quaternion,
  Vector3,
} from "@babylonjs/core/Maths/math.vector.js";

const tempMatrix = new Matrix();

const translation = new Vector3();
const scale = new Vector3();
const quaternion = new Quaternion();

export class EntityInstance {
  constructor(
    public readonly index: number,
    public readonly _tool: EntityTool
  ) {}

  setVisible(visible: boolean) {
    this._tool._visibleArray[this.index] = visible ? 1 : 0;
    this.syncMatrix();
  }

  private syncMatrix() {
    const dataIndex = this.index * 3;

    const positionX = this._tool._positionArray[dataIndex];
    const positionY = this._tool._positionArray[dataIndex + 1];
    const positionZ = this._tool._positionArray[dataIndex + 2];
    translation.set(positionX, positionY, positionZ);

    let scaleX = this._tool._scaleArray[dataIndex];
    let scaleY = this._tool._scaleArray[dataIndex + 1];
    let scaleZ = this._tool._scaleArray[dataIndex + 2];
    if (!this._tool._visibleArray[this.index]) {
      scaleX = 0;
      scaleY = 0;
      scaleZ = 0;
    }

    scale.set(scaleX, scaleY, scaleZ);

    const rotationX = this._tool._rotationArray[dataIndex];
    const rotationY = this._tool._rotationArray[dataIndex + 1];
    const rotationZ = this._tool._rotationArray[dataIndex + 2];
    Quaternion.RotationYawPitchRollToRef(
      rotationY,
      rotationX,
      rotationZ,
      quaternion
    );

    Matrix.ComposeToRef(scale, quaternion, translation, tempMatrix);

    const trueIndex = this.index * 16;
    for (let i = 0; i < 16; i++) {
      this._tool._matrixArray[trueIndex + i] = tempMatrix.m[i];
    }
  }

  setPosition(x: number, y: number, z: number) {
    const positionIndex = this.index * 3;
    this._tool._positionArray[positionIndex] = x;
    this._tool._positionArray[positionIndex + 1] = y;
    this._tool._positionArray[positionIndex + 2] = z;

    this.syncMatrix();
  }

  setData(
    positionX: number,
    positionY: number,
    positionZ: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
    rotationX: number,
    rotationY: number,
    rotationZ: number
  ) {
    const dataIndex = this.index * 3;

    this._tool._positionArray[dataIndex] = positionX;
    this._tool._positionArray[dataIndex + 1] = positionY;
    this._tool._positionArray[dataIndex + 2] = positionZ;

    this._tool._scaleArray[dataIndex] = scaleX;
    this._tool._scaleArray[dataIndex + 1] = scaleY;
    this._tool._scaleArray[dataIndex + 2] = scaleZ;

    this._tool._rotationArray[dataIndex] = rotationX;
    this._tool._rotationArray[dataIndex + 1] = rotationY;
    this._tool._rotationArray[dataIndex + 2] = rotationZ;
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
