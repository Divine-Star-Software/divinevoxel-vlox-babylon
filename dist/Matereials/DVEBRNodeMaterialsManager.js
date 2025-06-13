export class DVEBRMaterialRegister {
    materials = new Map();
    get(id) {
        const material = this.materials.get(id);
        if (!material)
            throw new Error(`Material with id ${id} does not exists`);
        return material;
    }
    register(id, material) {
        this.materials.set(id, material);
    }
}
