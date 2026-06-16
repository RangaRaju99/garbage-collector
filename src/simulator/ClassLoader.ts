import { instance as metaspace } from './MetaspaceEngine';

export class ClassLoader {
  private id: string;
  
  constructor(id: string) {
    this.id = id;
  }

  load(className: string): boolean {
    return metaspace.loadClass(className, this.id);
  }

  dispose() {
    metaspace.unloadByLoader(this.id);
  }
}

export const appClassLoader = new ClassLoader('app-loader');
export const systemClassLoader = new ClassLoader('system-loader');