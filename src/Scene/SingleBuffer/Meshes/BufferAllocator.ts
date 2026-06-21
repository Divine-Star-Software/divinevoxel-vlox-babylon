/**
 * Buddy buffer allocator
 */
export class BufferAllocator {
  readonly size: number;

  private readonly minBlockSize: number;
  private readonly minBlockShift: number; // log2(minBlockSize)
  private readonly sizeShift: number; // log2(size)
  private readonly levels: number; // sizeShift - minBlockShift + 1
  private readonly numBlocks: number; // size / minBlockSize

  /* Doubly-linked free lists. Keyed by block-index (= offset / minBlockSize).
   * -1 means "no link" (head/tail terminator).
   */
  private readonly nextFree: Int32Array;
  private readonly prevFree: Int32Array;
  private readonly freeHead: Int32Array;

  private nonEmptyMask: number = 0;

  /* Per-block-index state byte:
   *   0xFF             = not the start of any block right now (inside another block)
   *   0x00..0x7E       = start of a FREE block at level (state & 0x7F)
   *   0x80..0xFE       = start of an ALLOCATED block at level (state & 0x7F)
   */
  private readonly state: Uint8Array;

  private static readonly STATE_NONE = 0xff;
  private static readonly STATE_ALLOC = 0x80;

  constructor(size: number, minBlockSize: number = 64) {
    if (!Number.isInteger(size) || size <= 0 || (size & (size - 1)) !== 0) {
      throw new Error("size must be a positive power of 2.");
    }
    if (size > 1 << 30) {
      throw new Error(
        "size must be <= 2^30 (JavaScript 32-bit bitwise limit).",
      );
    }
    if (
      !Number.isInteger(minBlockSize) ||
      minBlockSize <= 0 ||
      (minBlockSize & (minBlockSize - 1)) !== 0 ||
      minBlockSize > size
    ) {
      throw new Error(
        "minBlockSize must be a positive power of 2 and <= size.",
      );
    }

    this.size = size;
    this.minBlockSize = minBlockSize;
    this.minBlockShift = 31 - Math.clz32(minBlockSize);
    this.sizeShift = 31 - Math.clz32(size);
    this.numBlocks = size >>> this.minBlockShift;
    this.levels = this.sizeShift - this.minBlockShift + 1;

    this.nextFree = new Int32Array(this.numBlocks);
    this.prevFree = new Int32Array(this.numBlocks);
    this.freeHead = new Int32Array(this.levels);
    this.state = new Uint8Array(this.numBlocks);

    this.freeHead.fill(-1);
    this.state.fill(BufferAllocator.STATE_NONE);

    this.state[0] = 0;
    this.nextFree[0] = -1;
    this.prevFree[0] = -1;
    this.freeHead[0] = 0;
    this.nonEmptyMask = 1;
  }

  allocate(requestedSize: number): number | null {
    if (
      typeof requestedSize !== "number" ||
      !Number.isFinite(requestedSize) ||
      requestedSize <= 0 ||
      requestedSize > this.size
    ) {
      return null;
    }

    const need =
      requestedSize < this.minBlockSize
        ? this.minBlockSize
        : Math.ceil(requestedSize);

    const blockShift =
      (need & (need - 1)) === 0 ? 31 - Math.clz32(need) : 32 - Math.clz32(need);
    const targetLevel = this.sizeShift - blockShift;

    const candidateMask = this.nonEmptyMask & ((1 << (targetLevel + 1)) - 1);
    if (candidateMask === 0) return null;
    let level = 31 - Math.clz32(candidateMask);

    let blockIdx = this.freeHead[level];
    this._unlink(blockIdx, level);

    while (level < targetLevel) {
      level++;
      const halfBlocks = this.numBlocks >>> level;
      const buddyIdx = blockIdx + halfBlocks;
      this._link(buddyIdx, level);
    }

    this.state[blockIdx] = targetLevel | BufferAllocator.STATE_ALLOC;
    return blockIdx << this.minBlockShift;
  }

  free(offset: number): void {
    if (
      typeof offset !== "number" ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset >= this.size ||
      (offset & (this.minBlockSize - 1)) !== 0
    ) {
      throw new Error("Invalid free: offset is out of range or not aligned.");
    }

    let idx = offset >>> this.minBlockShift;
    const s = this.state[idx];
    if ((s & BufferAllocator.STATE_ALLOC) === 0) {
      throw new Error("Invalid free: block not allocated or unknown offset.");
    }

    let level = s & 0x7f;
    this.state[idx] = BufferAllocator.STATE_NONE;

    while (level > 0) {
      const halfBlocks = this.numBlocks >>> level;
      const buddyIdx = idx ^ halfBlocks;
      if (this.state[buddyIdx] !== level) break;
      this._unlink(buddyIdx, level);
      this.state[buddyIdx] = BufferAllocator.STATE_NONE;
      if (buddyIdx < idx) idx = buddyIdx;
      level--;
    }

    this._link(idx, level);
  }

  private _link(blockIdx: number, level: number): void {
    const head = this.freeHead[level];
    this.nextFree[blockIdx] = head;
    this.prevFree[blockIdx] = -1;
    if (head !== -1) this.prevFree[head] = blockIdx;
    this.freeHead[level] = blockIdx;
    this.state[blockIdx] = level;
    this.nonEmptyMask |= 1 << level;
  }

  private _unlink(blockIdx: number, level: number): void {
    const next = this.nextFree[blockIdx];
    const prev = this.prevFree[blockIdx];
    if (prev === -1) {
      this.freeHead[level] = next;
      if (next === -1) this.nonEmptyMask &= ~(1 << level);
    } else {
      this.nextFree[prev] = next;
    }
    if (next !== -1) this.prevFree[next] = prev;
  }
}
