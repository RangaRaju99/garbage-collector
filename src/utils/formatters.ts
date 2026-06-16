export const formatMemory = (kb: number): string => {
  if (kb < 1024) return `${kb.toFixed(0)}KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)}MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)}GB`;
};

export const formatDuration = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  return `${ms.toFixed(3)}ms`;
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
};
