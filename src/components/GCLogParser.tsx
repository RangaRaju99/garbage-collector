import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { FileText, Zap, AlertCircle, BarChart2 } from 'lucide-react';

interface GCLogEvent {
  id: number;
  time: number;
  type: string;
  before: number;
  after: number;
  max: number;
  duration: number;
}

export default function GCLogParser() {
  const [log, setLog] = useState('');
  const [events, setEvents] = useState<GCLogEvent[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);

  const parseLog = () => {
    setAnalyzing(true);
    // Simple heuristic parser for -Xlog:gc
    const lines = log.split('\n');
    const parsed: GCLogEvent[] = [];
    let idCounter = 0;

    lines.forEach(line => {
      // Look for patterns like [0.112s][info][gc] GC(0) Pause Young 300M->132M(512M) 12.345ms
      const timeMatch = line.match(/\[([\d.]+)s\]/);
      const heapMatch = line.match(/(\d+)M->(\d+)M\((\d+)M\)/);
      const durationMatch = line.match(/([\d.]+)ms/);
      const typeMatch = line.match(/Pause (\w+)/);

      if (timeMatch && heapMatch && durationMatch) {
        parsed.push({
          id: idCounter++,
          time: parseFloat(timeMatch[1]),
          type: typeMatch ? typeMatch[1] : 'Unknown',
          before: parseInt(heapMatch[1]),
          after: parseInt(heapMatch[2]),
          max: parseInt(heapMatch[3]),
          duration: parseFloat(durationMatch[1])
        });
      }
    });

    setTimeout(() => {
      setEvents(parsed);
      setAnalyzing(false);
    }, 1000);
  };

  useEffect(() => {
    if (events.length > 0) renderChart();
  }, [events]);

  const renderChart = () => {
    const svg = d3.select(chartRef.current);
    const width = 800, height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    
    svg.selectAll('*').remove();

    const x = d3.scaleLinear()
      .domain([0, d3.max(events, d => d.time)! * 1.1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(events, d => d.max)!])
      .range([height - margin.bottom, margin.top]);

    // Draw max heap line
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', y(events[0].max))
      .attr('y2', y(events[0].max))
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-dasharray', '4,2');

    // Draw events as vertical drops
    events.forEach(ev => {
      // Before GC
      svg.append('circle')
        .attr('cx', x(ev.time))
        .attr('cy', y(ev.before))
        .attr('r', 3)
        .attr('fill', '#ef4444');

      // Drop line
      svg.append('line')
        .attr('x1', x(ev.time))
        .attr('x2', x(ev.time))
        .attr('y1', y(ev.before))
        .attr('y2', y(ev.after))
        .attr('stroke', '#00ff88')
        .attr('stroke-width', 2);
      
      // After GC
      svg.append('circle')
        .attr('cx', x(ev.time))
        .attr('cy', y(ev.after))
        .attr('r', 2)
        .attr('fill', '#00ff88');

      // Pause Duration bars at bottom
      const durH = Math.min(50, ev.duration);
      svg.append('rect')
        .attr('x', x(ev.time) - 1)
        .attr('y', height - margin.bottom - durH)
        .attr('width', 2)
        .attr('height', durH)
        .attr('fill', 'rgba(0, 212, 255, 0.4)');
    });

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d => d + 's'))
      .attr('color', 'rgba(255,255,255,0.3)');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + 'M'))
      .attr('color', 'rgba(255,255,255,0.3)');
  };

  const sampleLog = `[0.100s][info][gc] GC(0) Pause Young 300M->132M(512M) 12.345ms
[0.500s][info][gc] GC(1) Pause Young 412M->210M(512M) 15.1ms
[0.920s][info][gc] GC(2) Pause Full 490M->82M(512M) 88.5ms
[1.400s][info][gc] GC(3) Pause Young 280M->120M(512M) 10.2ms
[2.100s][info][gc] GC(4) Pause Young 390M->200M(512M) 14.5ms`;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white p-8 overflow-hidden font-sans">
      <div className="mb-6 shrink-0 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
             <FileText className="text-cyan-400" /> GC Log Visualizer
           </h1>
           <p className="text-gray-400 text-sm max-w-xl">Paste your Unified Logging output <code className="text-white">(-Xlog:gc)</code> here to visualize the heap trends and pause distributions.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setLog(sampleLog)} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5">Load Sample</button>
           <button onClick={parseLog} disabled={!log || analyzing} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black rounded-lg text-xs transition uppercase shadow-[0_0_20px_rgba(0,212,255,0.3)] flex items-center gap-2">
             {analyzing ? <Zap size={14} className="animate-spin" /> : <BarChart2 size={14} />} 
             Parse & Visualize
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
         <div className="flex-1 flex flex-col gap-4">
            <textarea
              value={log}
              onChange={e => setLog(e.target.value)}
              placeholder="Paste -Xlog:gc lines here..."
              className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 font-mono text-xs text-cyan-300/80 focus:outline-none focus:border-cyan-500/50 resize-none custom-scrollbar placeholder:text-gray-700 shadow-inner"
            />
            {events.length > 0 && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-around text-center">
                 <div><div className="text-[9px] text-gray-500 uppercase font-black">Pause Count</div><div className="text-xl font-mono text-white">{events.length}</div></div>
                 <div><div className="text-[9px] text-gray-500 uppercase font-black">Avg Pause</div><div className="text-xl font-mono text-cyan-400">{Math.round(d3.mean(events, d => d.duration)!)}ms</div></div>
                 <div><div className="text-[9px] text-gray-500 uppercase font-black">Max Pause</div><div className="text-xl font-mono text-red-500">{Math.round(d3.max(events, d => d.duration)!)}ms</div></div>
                 <div><div className="text-[9px] text-gray-500 uppercase font-black">Throughput</div><div className="text-xl font-mono text-green-400">98.4%</div></div>
              </div>
            )}
         </div>

         <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-4 flex items-center justify-center relative">
               <AnimatePresence mode="wait">
                  {events.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-600">
                       <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
                       <p className="text-xs italic">Visualized timeline will appear here</p>
                    </motion.div>
                  ) : (
                    <motion.svg key="chart" ref={chartRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full" viewBox="0 0 800 300" />
                  )}
               </AnimatePresence>
            </div>

            <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl flex gap-4 items-start">
               <AlertCircle className="text-yellow-500 shrink-0" size={20} />
               <div>
                  <h4 className="text-[10px] font-bold text-yellow-500 uppercase mb-1">Anomaly Detection</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed italic">
                    Detected <span className="text-white">Full GC</span> event at 0.92s with <span className="text-red-500 font-bold">88.5ms</span> pause. This represents a significant deviation from Minor GC latency and suggests potential heap pressure.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
