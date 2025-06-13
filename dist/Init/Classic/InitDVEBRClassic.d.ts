import { DVEBRDefaultMaterialBaseData } from "../../Matereials/Types/DVEBRDefaultMaterial.types";
import { WorkItemProgress } from "@divinevoxel/vlox/Util/WorkItemProgress";
export type DVEBRClassicData = DVEBRDefaultMaterialBaseData & {
    doSun?: boolean;
    doRGB?: boolean;
    doAO?: boolean;
} & {
    getProgress?: (progress: WorkItemProgress) => void;
};
export default function InitDVEBRClassic(initData: DVEBRClassicData): Promise<import("../../Renderer/DVEBabylonRenderer").DVEBabylonRenderer>;
