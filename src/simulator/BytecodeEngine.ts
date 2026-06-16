export interface BytecodeInstruction {
  op: string;
  arg?: any;
  stackSizeChange: number;
}

export class BytecodeEngine {
  private stack: any[] = [];

  execute(instruction: BytecodeInstruction) {
    // Basic simulation of a stack-based machine
    if (instruction.op === 'new') {
      this.stack.push('obj_ref');
    } else if (instruction.op === 'invokevirtual') {
      this.stack.pop();
    }
  }

  getStack() {
    return this.stack;
  }
}

export const instance = new BytecodeEngine();