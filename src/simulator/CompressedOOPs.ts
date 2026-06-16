export class CompressedOOPs {
  
  calculatePointerSize(heapSizeGB: number): 32 | 64 {
    // Threshold is exactly 32GB
    if (heapSizeGB <= 32) return 32;
    return 64;
  }

  getEfficiency(heapSizeGB: number): number {
    if (heapSizeGB <= 32) return 1.0; // Optimal
    // 64-bit pointers take double space, reducing cache efficiency
    return 0.7; 
  }

  getBinaryRepresentation(ptr: number, heapSizeGB: number): string {
    if (heapSizeGB <= 32) {
      // Shift right by 3 bits to store in 32-bit (8-byte alignment trick)
      return (ptr >>> 3).toString(2).padStart(32, '0');
    }
    return ptr.toString(2).padStart(64, '0');
  }
}

export const instance = new CompressedOOPs();