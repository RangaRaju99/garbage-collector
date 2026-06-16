export class StringPool {
  private pool: Set<string> = new Set();
  private duplicateSaves = 0;

  intern(str: string): string {
    if (this.pool.has(str)) {
      this.duplicateSaves++;
      return str; // In reality returns the pooled instance
    }
    this.pool.add(str);
    return str;
  }

  getStats() {
    return {
      poolSize: this.pool.size,
      duplicateSaves: this.duplicateSaves
    };
  }

  clear() {
    this.pool.clear();
    this.duplicateSaves = 0;
  }
}

export const instance = new StringPool();