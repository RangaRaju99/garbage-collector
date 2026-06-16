import { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

export default function L10_Level() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const W = 480, H = 220, pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const w = W - pad.left - pad.right;
    const h = H - pad.top - pad.bottom;

    const g = svg.append('g').attr('transform', `translate(${pad.left},${pad.top})`);

    // Survival data: [gcCycle, percentAlive]
    const data = [[0, 100], [1, 8], [2, 4], [3, 2.5], [5, 1.5], [10, 1.0], [15, 0.8]];

    const x = d3.scaleLinear().domain([0, 15]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    // Gradient fill
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'survivalGrad').attr('x1', '0').attr('x2', '0').attr('y1', '0').attr('y2', '1');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#00d4ff').attr('stop-opacity', 0.4);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#00d4ff').attr('stop-opacity', 0.02);

    // Area
    const area = d3.area<number[]>().x(d => x(d[0])).y0(h).y1(d => y(d[1])).curve(d3.curveCatmullRom);
    g.append('path').datum(data).attr('fill', 'url(#survivalGrad)').attr('d', area);

    // Line
    const line = d3.line<number[]>().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCatmullRom);
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#00d4ff').attr('stroke-width', 2.5).attr('d', line);

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => `GC ${d}`))
      .selectAll('text').style('fill', '#555').style('font-size', '11px');
    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .selectAll('text').style('fill', '#555').style('font-size', '11px');

    // Annotation: 90% die at GC 1
    g.append('line').attr('x1', x(1) - 5).attr('x2', x(1) - 5).attr('y1', y(100)).attr('y2', y(8))
      .attr('stroke', '#ff4444').attr('stroke-dasharray', '4,2').attr('stroke-width', 1);
    g.append('text').attr('x', x(1) + 5).attr('y', y(50)).attr('fill', '#ff4444').attr('font-size', 10)
      .text('92% die in GC #1');

    // Annotation: y=5%  Old Gen threshold
    g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(5)).attr('y2', y(5))
      .attr('stroke', '#ffaa00').attr('stroke-dasharray', '4,2').attr('stroke-width', 1).attr('opacity', 0.5);
    g.append('text').attr('x', w - 2).attr('y', y(5) - 4).attr('fill', '#ffaa00').attr('font-size', 10).attr('text-anchor', 'end')
      .text('Old Gen threshold → 5%');
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-y-auto font-sans">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] rounded text-[10px] font-mono text-[#00d4ff]">L10</span>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">INTERMEDIATE TRACK</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Generational Hypothesis</h1>
        <p className="text-gray-400 text-sm">The foundational insight behind every modern GC: <em>most objects die young.</em></p>
      </div>

      {/* D3 Survival Curve */}
      <div className="px-8 pb-5">
        <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.15)] rounded-xl p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">OBJECT SURVIVAL CURVE</div>
          <svg ref={svgRef} width="100%" viewBox="0 0 480 220" preserveAspectRatio="xMidYMid meet" />
        </div>
      </div>

      {/* Key Stats */}
      <div className="px-8 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { pct: '~92%', label: 'Die in first GC', color: '#ff4444', sub: 'Method returns, request completes, temp objects' },
            { pct: '~5%', label: 'Reach Old Gen', color: '#ffaa00', sub: 'Long-lived domain objects, caches, singletons' },
            { pct: '~3%', label: 'Intermediate', color: '#00d4ff', sub: 'Survive 2-15 GCs in Survivor spaces' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.pct}</div>
              <div className="text-xs font-bold text-white mb-1">{s.label}</div>
              <div className="text-[10px] text-gray-500 leading-snug">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Generations Work */}
      <div className="px-8 pb-6">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-sm text-[#00d4ff] font-bold mb-3 flex items-center gap-2"
        >
          {showComparison ? '▼' : '▶'} Why generations make GC dramatically faster
        </button>
        {showComparison && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[rgba(255,0,0,0.2)] bg-[rgba(255,0,0,0.04)]">
              <div className="text-xs font-bold text-red-400 mb-2">❌ Without Generations (Flat Heap)</div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Scan 512MB heap every GC</div>
                <div>• Touch every live object</div>
                <div className="font-bold text-red-400">→ 480ms pause for 512MB heap</div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.04)]">
              <div className="text-xs font-bold text-green-400 mb-2">✅ With Generations (Minor GC)</div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Scan only Young Gen (~50MB)</div>
                <div>• 92% of scanned objects → dead</div>
                <div className="font-bold text-green-400">→ 12ms pause, 40× faster</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}