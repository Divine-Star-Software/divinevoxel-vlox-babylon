/**
 * Class to manage buffer allocation using the buddy algorithm,
 * using Sets for free lists to speed up add/remove.
 */
export declare class BufferAllocator {
    /** Total size of the memory pool in bytes */
    size: number;
    /** Minimum allocatable block size (power of 2) */
    private minBlockSize;
    /** Number of levels in the buddy system */
    private levels;
    /**
     * Free lists, keyed by level.
     * - `level = 0` is the largest block (entire buffer).
     * - `level = levels - 1` is the smallest block (minBlockSize).
     *
     * Each free list is now a Set<number>, so membership checks & removals are O(1).
     */
    private freeLists;
    /**
     * Tracks currently allocated blocks:
     *   key = offset, value = block size.
     */
    private allocations;
    constructor(size: number, minBlockSize?: number);
    /**
     * Allocate a block of at least `requestedSize` bytes.
     * Returns the offset in the buffer or `null` if no space.
     */
    allocate(requestedSize: number): number | null;
    /**
     * Free (deallocate) a previously allocated block at given `offset`.
     */
    free(offset: number): void;
    /**
     * Splits a block from `startLevel` down to `targetLevel`.
     * Returns the final allocated offset.
     */
    private splitAndAllocate;
    /**
     * Attempt to merge (coalesce) a freed block with its buddy
     * to form a larger free block at the next higher level.
     */
    private tryCoalesce;
    /**
     * Given a block size, return its level.
     * e.g. if blockSize = 64 and total size=1024 => level=4 (0-based).
     */
    private getLevel;
}
