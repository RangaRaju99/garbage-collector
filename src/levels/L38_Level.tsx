import ReferenceQueueChapter from '../chapters/ReferenceQueueChapter';

export default function L38_Level() {
  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden font-sans">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(255,170,0,0.15)] border border-[rgba(255,170,0,0.3)] rounded text-[10px] font-mono text-[#ffaa00]">L38</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">JVM ENGINEER</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ReferenceQueueChapter />
      </div>
    </div>
  );
}
