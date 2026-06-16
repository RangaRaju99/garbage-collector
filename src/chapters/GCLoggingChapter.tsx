import { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

type LogLine = { time: string; type: string; raw: string; gcNum: number; pause: number; before: number; after: number; total: number; };

const sampleLog = `[0.100s][info][gc,start] GC(0) Pause Young (Normal) (G1 Evacuation Pause)
[0.100s][info][gc,task ] GC(0) Using 8 workers
[0.112s][info][gc,heap ] GC(0) Eden: 200M(200M)->0B(200M)
[0.112s][info][gc,heap ] GC(0) Survivor: 0B(25M)->24M(25M)
[0.112s][info][gc,heap ] GC(0) Old Gen: 100M->108M
[0.112s][info][gc      ] GC(0) Pause Young 300M->132M(512M) 12.345ms
[1.200s][info][gc,start] GC(1) Pause Young (Normal) (G1 Evacuation Pause)
[1.200s][info][gc,task ] GC(1) Using 8 workers
[1.218s][info][gc,heap ] GC(1) Eden: 200M(200M)->0B(200M)
[1.218s][info][gc      ] GC(1) Pause Young 340M->145M(512M) 18.210ms
[2.500s][info][gc,start] GC(2) Pause Young (Normal) (G1 Evacuation Pause)
[2.515s][info][gc      ] GC(2) Pause Young 380M->160M(512M) 15.000ms
[4.000s][info][gc,start] GC(3) Pause Mixed (G1 Mixed Evacuation Pause)
[4.040s][info][gc      ] GC(3) Pause Mixed 420M->200M(512M) 40.500ms
[6.100s][info][gc,start] GC(4) Pause Young (Normal) (G1 Evacuation Pause)
[6.650s][info][gc      ] GC(4) Pause Young 430M->210M(512M) 550.000ms
[6.650s][warning][gc  ] GC(4) Pause exceeded 200ms target!`;

function parseLog(log: string): LogLine[] {
  const lines: LogLine[] = [];
  const re = /\[([^\]]+)s\]\[info\]\[gc\s*\]\s+GC\((\d+)\)\s+Pause\s+\w+\s+(\d+)M->(\d+)M\((\d+)M\)\s+([\d.]+)ms/g;
  let m;
  while ((m = re.exec(log)) !== null) {
    lines.push({ time: m[1], type: 'Young', raw: m[0], gcNum: +m[2], before: +m[3], after: +m[4], total: +m[5], pause: +m[6] });
  }
  return lines;
}

export default function GCLoggingChapter() {
  const [logText, setLogText] = useState(sampleLog);
  const [parsed, setParsed] = useState<LogLine[]>(() => parseLog(sampleLog));
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!parsed.length || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const W = 500, H = 140, pad = { top: 16, right: 20, bottom: 36, left: 50 };
    const w = W - pad.left - pad.right, h = H - pad.top - pad.bottom;
    const g = svg.append('g').attr('transform', `translate(${pad.left},${pad.top})`);
    const x = d3.scaleLinear().domain([0, parsed.length - 1]).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(parsed, d => d.pause)! * 1.2]).range([h, 0]);
    g.selectAll('rect').data(parsed).enter().append('rect')
      .attr('x', (_, i) => x(i) - 14)
      .attr('width', 28)
      .attr('y', d => y(d.pause))
      .attr('height', d => h - y(d.pause))
      .attr('fill', d => d.pause > 200 ? '#ff4444' : d.pause > 50 ? '#ffaa00' : '#00ff88')
      .attr('rx', 3);
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(parsed.length).tickFormat((_, i) => `GC(${i})`)).selectAll('text').style('fill', '#555').style('font-size', '10px');
    g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}ms`)).selectAll('text').style('fill', '#555').style('font-size', '10px');
    // Target line 200ms
    g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(200)).attr('y2', y(200)).attr('stroke', '#ffaa00').attr('stroke-dasharray', '4,2').attr('opacity', 0.6);
    g.append('text').attr('x', w).attr('y', y(200) - 4).attr('fill', '#ffaa00').attr('font-size', 9).attr('text-anchor', 'end').text('200ms target');
  }, [parsed]);

  const handleParse = () => setParsed(parseLog(logText));

  const maxPause = parsed.length ? Math.max(...parsed.map(p => p.pause)) : 0;
  const avgPause = parsed.length ? parsed.reduce((a, b) => a + b.pause, 0) / parsed.length : 0;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans p-6">
      <h1 className="text-2xl font-black mb-1">GC Log Parser & Analyzer</h1>
      <p className="text-gray-400 text-sm mb-4">Paste <code className="text-[#00d4ff]">-Xlog:gc</code> output and get instant visual analysis with anomaly detection.</p>

      {/* Log input */}
      <div className="mb-4">
        <textarea value={logText} onChange={e => setLogText(e.target.value)} rows={6}
          className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3 font-mono text-[10px] text-gray-300 resize-none focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
          placeholder="Paste GC log output here..." />
        <button onClick={handleParse} className="mt-2 px-4 py-1.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded-lg text-xs font-bold transition hover:bg-[rgba(0,212,255,0.25)]">
          ▶ Parse & Analyze
        </button>
      </div>

      {/* Chart */}
      {parsed.length > 0 && (
        <>
          <div className="mb-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">PAUSE TIME CHART</div>
            <svg ref={svgRef} width="100%" viewBox="0 0 500 140" preserveAspectRatio="xMidYMid meet" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)] text-center">
              <div className="text-xl font-black text-[#00d4ff]">{parsed.length}</div>
              <div className="text-[10px] text-gray-500">GC Events</div>
            </div>
            <div className="p-3 rounded-lg border border-[rgba(255,170,0,0.2)] bg-[rgba(255,170,0,0.05)] text-center">
              <div className="text-xl font-black text-[#ffaa00]">{avgPause.toFixed(1)}ms</div>
              <div className="text-[10px] text-gray-500">Avg Pause</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${maxPause > 200 ? 'border-red-500/30 bg-red-500/08' : 'border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)]'}`}>
              <div className={`text-xl font-black ${maxPause > 200 ? 'text-red-400' : 'text-[#00ff88]'}`}>{maxPause.toFixed(0)}ms</div>
              <div className="text-[10px] text-gray-500">Max Pause</div>
            </div>
          </div>

          {/* Anomaly detection */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ANOMALY DETECTION</div>
            {parsed.filter(p => p.pause > 200).map(p => (
              <div key={p.gcNum} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="text-red-400 text-sm">🔴</span>
                <div>
                  <div className="text-xs font-bold text-red-400">GC({p.gcNum}) pause {p.pause}ms — exceeds 200ms target!</div>
                  <div className="text-[10px] text-gray-500">Check: heap sizing, G1 region size, promotion failure</div>
                </div>
              </div>
            ))}
            {parsed.filter(p => p.pause > 200).length === 0 && (
              <div className="p-3 rounded-lg bg-green-500/08 border border-green-500/20 text-xs text-green-400">✅ No pause time anomalies detected. All pauses within 200ms target.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}