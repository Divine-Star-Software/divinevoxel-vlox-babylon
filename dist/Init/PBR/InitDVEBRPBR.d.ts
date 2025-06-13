import { DVEBRDefaultMaterialBaseData } from "../../Matereials/Types/DVEBRDefaultMaterial.types";
import { WorkItemProgress } from "@divinevoxel/vlox/Util/WorkItemProgress";
export type DVEBRPBRData = DVEBRDefaultMaterialBaseData & {
    getProgress?: (progress: WorkItemProgress) => void;
};
export default function InitDVEPBR(initData: DVEBRPBRData): Promise<import("../../Renderer/DVEBabylonRenderer").DVEBabylonRenderer>;
