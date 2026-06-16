/**
 * Utility for bit-level manipulation and simulation of JVM internal structures.
 */
export const getBit = (value: number, position: number): number => {
  return (value >> position) & 1;
};

export const setBit = (value: number, position: number): number => {
  return value | (1 << position);
};

export const clearBit = (value: number, position: number): number => {
  return value & ~(1 << position);
};

/**
 * Simulates the 64-bit Mark Word state transitions.
 */
export const getMarkWordStatus = (markWord: number) => {
  const lastTwoBits = markWord & 0b11;
  switch (lastTwoBits) {
    case 0b01: return 'Normal / Biased';
    case 0b00: return 'Lightweight Locked';
    case 0b10: return 'Heavyweight Locked';
    case 0b11: return 'Marked for GC';
    default: return 'Unknown';
  }
};
