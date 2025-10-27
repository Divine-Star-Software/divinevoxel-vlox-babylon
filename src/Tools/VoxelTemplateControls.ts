import { Scene } from "@babylonjs/core/scene";
import { FullVoxelTemplate } from "@divinevoxel/vlox/Templates/Full/FullVoxelTemplate";
import { VoxelBoxSelectionControls } from "./VoxelBoxSelectionControls";
import { RayProvider } from "@divinevoxel/vlox/Builder/RayProvider";
import { VoxelBoxSelection } from "@divinevoxel/vlox/Templates/Selection/VoxelBoxSelection";
import { Vector3Axes, Vector3Like } from "@amodx/math";
import { Axes } from "@amodx/math/Vectors/Axes";
import FlipTemplate from "@divinevoxel/vlox/Templates/Functions/FlipTemplate";
import RotateTemplate, {
  TemplateRotationAngles,
} from "@divinevoxel/vlox/Templates/Functions/RotateTemplate";
import { VoxelBuildSpace } from "@divinevoxel/vlox/Builder/VoxelBuildSpace";
import { VoxelTemplateMesh } from "./VoxelTemplateMesh";
export class VoxelTemplateControls {
  selectionControls: VoxelBoxSelectionControls;
  mesh: VoxelTemplateMesh;
  constructor(
    public scene: Scene,
    public space: VoxelBuildSpace,
    public ray: RayProvider,
    public template: FullVoxelTemplate,
    public selection: VoxelBoxSelection = new VoxelBoxSelection()
  ) {
    this.selection.reConstruct(
      this.selection.bounds.min,
      Axes.UpReadOnly(),
      Vector3Like.Add(this.selection.bounds.min, template.bounds.size),
      Axes.UpReadOnly()
    );
    this.selectionControls = new VoxelBoxSelectionControls(
      scene,
      ray,
      this.selection,
      false
    );
    this.mesh = new VoxelTemplateMesh(scene);
    this.rebuildSelection();
  }

  private rebuildSelection() {
    this.selection.reConstruct(
      Vector3Like.Add(this.template.bounds.min, this.selection.origin),
      Axes.UpReadOnly(),
      Vector3Like.Add(this.template.bounds.max, this.selection.origin),
      Axes.UpReadOnly()
    );
    this.selectionControls.sync();
    this.mesh.update(this.template);
  }

  async place() {
    await this.space.paintTemplate(
      this.selection.origin,
      this.template.toJSON()
    );
  }

  async clear() {
    await this.space.eraseTemplate(
      this.selection.origin,
      this.template.toJSON()
    );
  }

  flip(axis: Vector3Axes) {
    FlipTemplate(this.template, axis);
    this.rebuildSelection();
  }

  rotate(axis: Vector3Axes, angle: TemplateRotationAngles) {
    RotateTemplate(this.template, angle, axis);
    this.rebuildSelection();
  }

  update(selectionActive: boolean) {
    this.selectionControls.update(selectionActive);

    console.log(
      "update",
      this.selection.bounds.min.x,
      this.selection.bounds.min.y,
      this.selection.bounds.min.z
    );
    this.mesh.parent.position.set(
      this.selection.bounds.min.x,
      this.selection.bounds.min.y,
      this.selection.bounds.min.z
    );
  }

  dispose() {
    this.selectionControls.dispose();
    this.mesh.dispose();
  }
}
