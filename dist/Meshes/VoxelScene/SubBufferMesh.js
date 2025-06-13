export class SubBufferMesh {
    verticesStart = 0;
    verticesCount = 0;
    indicesStart = 0;
    indicesCount = 0;
    allocation;
    transform;
    mesh;
    _enabled = false;
    setEnabled(enabled) {
        this._enabled = enabled;
        if (enabled) {
            this.allocation._bufferMesh.voxelScene.active.set(this.mesh, this);
        }
        else {
            this.allocation._bufferMesh.voxelScene.active.delete(this.mesh);
        }
    }
    isEnabled() {
        return this._enabled;
    }
    render() {
        this.allocation._bufferMesh.render(this.mesh, false, this.transform);
    }
}
