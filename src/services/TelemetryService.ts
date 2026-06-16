import { useJVMStore } from '../store/jvmStore';

/**
 * Service to orchestrate event broadcasting from core engines to the UI and external listeners.
 */
class TelemetryService {
  private static instance: TelemetryService;
  
  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public logGC(type: string, duration: number, memoryReclaimed: number) {
    const store = useJVMStore.getState();
    store.addEvent(
      'GC_EVENT', 
      `${type} collection reclaimed ${memoryReclaimed}MB in ${duration}ms`, 
      duration
    );
    
    // External integration point (e.g. Segment, Datadog etc could go here)
  }

  public logOOM(error: string) {
    useJVMStore.getState().addEvent('CRITICAL', `OOM ERROR: ${error}`, 0);
  }

  public logJIT(method: string, tier: string) {
    useJVMStore.getState().addEvent('JIT', `Method ${method} compiled to ${tier}`, 0);
  }
}

export const telemetry = TelemetryService.getInstance();
