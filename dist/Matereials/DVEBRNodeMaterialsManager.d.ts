import { MaterialInterface } from "./MaterialInterface";
export declare class DVEBRMaterialRegister {
    materials: Map<string, MaterialInterface<import("./MaterialInterface").MaterialData<any>>>;
    get(id: string): MaterialInterface;
    register(id: string, material: MaterialInterface): void;
}
