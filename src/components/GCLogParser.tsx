import { useJVMStore } from '../store/jvmStore';
import { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { FileText, BarChart2, AlertCircle, Upload, RefreshCw } from 'lucide-react';

interface GCLogEvent {
  id: number;
  time: number;
  type: string;
  before: number;
  after: number;
  max: number;
  duration: number;
}

const SAMPLE_LOG = `[0.100s][info][gc] GC(0) Pause Young 300M->132M(512M) 12.345ms
[0.500s][info][gc] GC(1) Pause Young 412M->210M(512M) 15.1ms
[0.920s][info][gc] GC(2) Pause Full 490M->82M(512M) 88.5ms
[1.400s][info][gc] GC(3) Pause Young 280M->120M(512M) 10.2ms
[2.100s][info][gc] GC(4) Pause Young 390M->200M(512M) 14.5ms
[2.800s][info][gc] GC(5) Pause Young 440M->180M(512M) 18.3ms
[3.500s][info][gc] GC(6) Pause Full 510M->90M(512M) 95.1ms`;

export default function GCLogParser() {
  const [log, setLog] = useState('');
  const [events, setEvents] = useState<GCLogEvent[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);
  const addEvent = useJVMStore(state => state.addEvent);

  const parseLog = () => {
    if (!log.trim()) return;
    setAnalyzing(true);

    const lines = log.split('\n');
    const parsed: GCLogEvent[] = [];
    let idCounter = 0;

    lines.forEach(line => {
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
          duration: parseFloat(durationMatch[1]),
        });
      }
    });

    setTimeout(() => {
      setEvents(parsed);
      setAnalyzing(false);
      if (parsed.length > 0) {
        addEvent('LOG', `Parsed ${parsed.length} GC events from log`, 0);
      }
    }, 700);
  };

  useEffect(() => {
    if (events.length > 0) renderChart();
  }, [events]);

  const renderChart = () => {
    const svg = d3.select(chartRef.current);
    const width = 560; const height = 200;
    const margin = { top: 16, right: 20, bottom: 32, left: 44 };

    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(events, d => d.time)! * 1.05])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(events, d => d.max)!])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append('g').selectAll('line')
      .data(y.ticks(4)).enter().append('line')
      .attr('x1', margin.left).attr('x2', width - margin.right)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(255,255,255,0.04)').attr('stroke-width', 1);

    // Draw GC events
    events.forEach(ev => {
      const isFull = ev.type === 'Full';
      svg.append('line')
        .attr('x1', x(ev.time)).attr('x2', x(ev.time))
        .attr('y1', y(ev.before)).attr('y2', y(ev.after))
        .attr('stroke', isFull ? '#ef4444' : '#10b981')
        .attr('stroke-width', isFull ? 2 : 1.5)
        .attr('opacity', 0.9);

      svg.append('circle')
        .attr('cx', x(ev.time)).attr('cy', y(ev.before))
        .attr('r', 3).attr('fill', '#ef4444');

      svg.append('circle')
        .attr('cx', x(ev.time)).attr('cy', y(ev.after))
        .attr('r', 2).attr('fill', '#10b981');
    });

    // Axes
    const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d => d + 's');
    const yAxis = d3.axisLeft(y).ticks(4).tickFormat(d => d + 'M');

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call(g => { g.attr('color', 'rgba(255,255,255,0.25)'); g.select('.domain').remove(); g.selectAll('line').attr('color', 'rgba(255,255,255,0.06)'); });

    svg.append('g').attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .call(g => { g.attr('color', 'rgba(255,255,255,0.25)'); g.select('.domain').remove(); g.selectAll('line').attr('color', 'rgba(255,255,255,0.06)'); });
  };

  const avgPause = events.length ? Math.round((events.reduce((s, e) => s + e.duration, 0) / events.length) * 10) / 10 : 0;
  const maxPause = events.length ? Math.round(Math.max(...events.map(e => e.duration)) * 10) / 10 : 0;
  const fullGCs = events.filter(e => e.type === 'Full').length;

  return (
    <div className="flex flex-col bg-surface-secondary border border-white/6 rounded-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-md">
            <FileText size={12} className="text-brand-primary" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-white">GC Log Visualizer</h3>
            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">-Xlog:gc</span>
          </div>
        </div>
        <button
          onClick={() => { setLog(SAMPLE_LOG); setEvents([]); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-zinc-500 bg-white/[0.03] border border-white/6 rounded-md hover:text-zinc-200 hover:bg-white/5 transition-all"
        >
          <Upload size={10} /> Load Sample
        </button>
      </div>

      {/* Textarea */}
      <div className="p-4 border-b border-white/5">
        <textarea
          value={log}
          onChange={e => setLog(e.target.value)}
          placeholder="Paste -Xlog:gc output here..."
          rows={5}
          className="w-full bg-black/30 border border-white/6 rounded-lg p-3 font-mono text-[10px] text-emerald-300/70 placeholder-zinc-700 focus:outline-none focus:border-brand-primary/40 custom-scrollbar resize-none transition-colors"
        />
        <button
          onClick={parseLog}
          disabled={!log.trim() || analyzing}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white text-[11px] font-bold rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {analyzing ? <RefreshCw size={12} className="animate-spin" /> : <BarChart2 size={12} />}
          {analyzing ? 'Analyzing...' : 'Parse & Visualize'}
        </button>
      </div>

      {/* Chart or placeholder */}
      <div className="p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart2 size={28} className="text-zinc-700 mb-3" />
            <p className="text-[10px] text-zinc-600 italic">Paste a GC log and click Parse to visualize heap trends</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Events', value: events.length.toString(), color: 'text-white' },
                { label: 'Avg Pause', value: `${avgPause}ms`, color: 'text-brand-primary' },
                { label: 'Max Pause', value: `${maxPause}ms`, color: 'text-status-error' },
                { label: 'Full GCs', value: fullGCs.toString(), color: fullGCs > 0 ? 'text-status-warning' : 'text-status-success' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center">
                  <div className={`text-[14px] font-black font-mono ${color}`}>{value}</div>
                  <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden p-2">
              <svg ref={chartRef} className="w-full" style={{ height: 200 }} />
            </div>

            {/* Anomaly */}
            {fullGCs > 0 && (
              <div className="flex items-start gap-3 mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  <span className="text-white font-bold">{fullGCs} Full GC event{fullGCs > 1 ? 's' : ''}</span> detected with {maxPause}ms max pause — indicates heap pressure. Consider tuning <code className="text-brand-primary">-Xmx</code> or switching to ZGC/Shenandoah.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
