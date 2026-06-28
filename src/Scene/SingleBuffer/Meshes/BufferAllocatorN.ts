export class BufferAllocator {
  private offset: number = 0;
  private readonly size: number;
  private allocations: Array<{ offset: number; size: number }> = [];

  constructor(size: number,minBlockSize: number = 64) {
    this.size = size;
  }

  allocate(requestedSize: number, minBlockSize: number = 64): number | null {
    if (this.offset + requestedSize > this.size) {
      // Try to defragment by compacting
      this.defragment();

      if (this.offset + requestedSize > this.size) {
        return null;
      }
    }

    const allocationOffset = this.offset;
    this.allocations.push({ offset: allocationOffset, size: requestedSize });
    this.offset += requestedSize;

    return allocationOffset;
  }

  free(offset: number): void {
    const idx = this.allocations.findIndex((a) => a.offset === offset);
    if (idx === -1) throw new Error("Invalid offset");

    this.allocations.splice(idx, 1);
  }

  private defragment() {
    // Sort by offset (already sorted, but for clarity)
    this.allocations.sort((a, b) => a.offset - b.offset);

    // Rewrite allocation offsets to be contiguous
    let newOffset = 0;
    const mapping = new Map<number, number>();

    for (const alloc of this.allocations) {
      mapping.set(alloc.offset, newOffset);
      alloc.offset = newOffset;
      newOffset += alloc.size;
    }

    this.offset = newOffset;

    // Return mapping so caller can update mesh references
    return mapping;
  }

  getAllocations(): Array<{ offset: number; size: number }> {
    return [...this.allocations];
  }
}
