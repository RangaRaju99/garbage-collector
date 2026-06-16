export class CardTable {
  private cards: Uint8Array;
  private readonly CARD_SIZE = 512; // 512 bytes per card

  constructor(heapSizeMB: number = 4096) {
    this.cards = new Uint8Array((heapSizeMB * 1024 * 1024) / this.CARD_SIZE);
  }

  dirtyCard(address: number) {
    const index = Math.floor(address / this.CARD_SIZE);
    if (index < this.cards.length) {
      this.cards[index] = 1;
    }
  }

  isDirty(address: number): boolean {
    const index = Math.floor(address / this.CARD_SIZE);
    return this.cards[index] === 1;
  }

  clear() {
    this.cards.fill(0);
  }

  getDirtyCount() {
    return this.cards.filter(c => c === 1).length;
  }
}

export const instance = new CardTable();