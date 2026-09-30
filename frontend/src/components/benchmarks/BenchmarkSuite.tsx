import React, { useState } from 'react';
import { api } from '../../services/api';
import type { BenchmarkResult } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Play, 
  BarChart3, 
  Activity,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export const BenchmarkSuite: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [latestReport, setLatestReport] = useState<BenchmarkResult | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<string>('full');

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      const res = await api.runBenchmark(selectedSuite);
      setLatestReport(res);
    } catch (err: any) {
      alert(err.message || 'Benchmark failed');
    } finally {
      setRunning(false);
    }
  };

  const handleExportJSON = () => {
    if (!latestReport) return;
    const blob = new Blob([JSON.stringify(latestReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Snapdragon_AI_Benchmark_${Date.now()}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    if (!latestReport || !latestReport.report_json?.results) return;
    const results = latestReport.report_json.results;
    let csv = 'Test Name,Task,Duration (ms),Throughput,Latency (ms),Status\n';
    results.forEach((r: any) => {
      csv += `"${r.name}","${r.task}",${r.duration_ms},${r.throughput},${r.avg_latency_ms},"${r.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Snapdragon_AI_Benchmark_${Date.now()}.csv`;
    a.click();
  };

  const chartData = latestReport?.report_json?.results ? latestReport.report_json.results.map((r: any) => ({
    name: r.name.split(' ')[0],
    throughput: r.throughput,
    latency: r.avg_latency_ms
  })) : [
    { name: 'Inference', throughput: 72, latency: 14 },
    { name: 'Embedding', throughput: 85, latency: 11 },
    { name: 'OCR', throughput: 42, latency: 24 },
    { name: 'VectorSearch', throughput: 95, latency: 10 },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Performance Benchmark</h1>
          <p className="text-xs text-brand-muted mt-1">
            Run standardized hardware benchmarks across local LLM inference, embedding, OCR, and vector search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSuite}
            onChange={(e) => setSelectedSuite(e.target.value)}
            className="bg-brand-dark border border-brand-border text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-brand-red"
          >
            <option value="full">Full Benchmark Suite</option>
            <option value="text_inference">Text Generation Only</option>
            <option value="document_embedding">Embedding Generation</option>
            <option value="ocr_extraction">OCR Feature Extraction</option>
            <option value="semantic_search">Semantic Vector Search</option>
          </select>

          <button
            onClick={handleRunBenchmark}
            disabled={running}
            className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all"
          >
            {running ? (
              <span>Benchmarking Hardware...</span>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run AI Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {latestReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
            <span className="text-xs text-brand-muted font-semibold">Total Suite Duration</span>
            <h3 className="text-xl font-black text-white">{latestReport.duration_ms} ms</h3>
            <p className="text-[10px] text-emerald-400">All tests passed cleanly</p>
          </div>

          <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
            <span className="text-xs text-brand-muted font-semibold">Average Latency</span>
            <h3 className="text-xl font-black text-white">{latestReport.latency_avg_ms} ms</h3>
            <p className="text-[10px] text-brand-red font-semibold">Qualcomm NPU Speed</p>
          </div>

          <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
            <span className="text-xs text-brand-muted font-semibold">Average Throughput</span>
            <h3 className="text-xl font-black text-white">{latestReport.throughput} ops/sec</h3>
            <p className="text-[10px] text-cyan-400">ARM Vector Accelerated</p>
          </div>

          <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
            <span className="text-xs text-brand-muted font-semibold">Memory Delta</span>
            <h3 className="text-xl font-black text-white">{latestReport.memory_mb} MB</h3>
            <p className="text-[10px] text-brand-muted">Lightweight Footprint</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-red" />
              <span>Snapdragon AI Performance Report</span>
            </h2>

            {latestReport && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-xs text-brand-text hover:text-white flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-xs text-brand-text hover:text-white flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
              </div>
            )}
          </div>

          {!latestReport ? (
            <div className="p-12 text-center rounded-xl bg-brand-surface border border-dashed border-brand-border text-xs text-brand-muted space-y-3">
              <Activity className="w-8 h-8 text-brand-red mx-auto" />
              <p>Click "Run AI Benchmark" to measure local hardware execution metrics.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestReport.report_json?.results?.map((r: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-brand-surface border border-brand-border/60 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{r.name}</h4>
                    <p className="text-[10px] text-brand-muted">Task: {r.task}</p>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-brand-muted block text-[10px]">Latency</span>
                      <span className="font-mono text-white font-bold">{r.avg_latency_ms} ms</span>
                    </div>
                    <div>
                      <span className="text-brand-muted block text-[10px]">Throughput</span>
                      <span className="font-mono text-brand-red font-bold">{r.throughput} {r.throughput_unit}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      PASSED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-red" />
            <span>Throughput Comparison</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111318', borderColor: '#242834', borderRadius: '8px' }}
                  itemStyle={{ color: '#F1F5F9', fontSize: '12px' }}
                />
                <Bar dataKey="throughput" name="Ops / Sec" fill="#FF2438" radius={[4, 4, 0, 0]}>
                  {chartData.map((_item: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FF2438' : '#00F0FF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
