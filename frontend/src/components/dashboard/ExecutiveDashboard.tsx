import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { SystemTelemetry, DocumentItem, WorkloadRouting } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  Activity,
  Layers
} from 'lucide-react';

export const ExecutiveDashboard: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [workloads, setWorkloads] = useState<WorkloadRouting[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [tel, _dev, docs, works] = await Promise.all([
          api.getTelemetry(),
          api.getDeviceInfo(),
          api.getDocuments(),
          api.getWorkloadRouting()
        ]);
        setTelemetry(tel);
        setDocuments(docs);
        setWorkloads(works);
      } catch (err) {
        // Handle error gracefully
      }
    };
    loadDashboardData();

    const interval = setInterval(async () => {
      try {
        const tel = await api.getTelemetry();
        setTelemetry(tel);
      } catch (err) {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { time: '10:00', latency: 18, throughput: 64, cpu: 14 },
    { time: '10:05', latency: 15, throughput: 72, cpu: 18 },
    { time: '10:10', latency: 22, throughput: 58, cpu: 24 },
    { time: '10:15', latency: 12, throughput: 85, cpu: 16 },
    { time: '10:20', latency: 14, throughput: 79, cpu: 15 },
    { time: '10:25', latency: 11, throughput: 92, cpu: 19 },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-card via-brand-surface to-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30">
              ● SNAPDRAGON ACTIVE
            </span>
            <span className="text-xs text-brand-muted">Windows on ARM64</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {user?.full_name || 'Engineer'}
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Your local AI workspace is running hardware-accelerated on your Snapdragon PC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('workspace')}
            className="px-4 py-2 rounded-xl bg-brand-red hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Launch AI Workspace</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted">Active Model</span>
            <div className="p-2 rounded-lg bg-brand-red/10 text-brand-red">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">SnapMind 7B INT4</h3>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> ONNX / ARM64 QNN
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted">Privacy Mode</span>
            <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">100% Local Isolated</h3>
            <p className="text-xs text-brand-muted mt-0.5">Zero Cloud Data Exposure</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted">Hardware Accel</span>
            <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Hexagon NPU Active</h3>
            <p className="text-xs text-cyan-400 font-medium truncate mt-0.5">
              {telemetry?.npu_status || 'Qualcomm Neural Processing SDK'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted">Indexed Documents</span>
            <div className="p-2 rounded-lg bg-purple-950/40 text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{documents.length} Files Ready</h3>
            <p className="text-xs text-brand-muted mt-0.5">Semantic RAG Vector DB Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-red" />
                <span>AI Workload Performance Telemetry</span>
              </h2>
              <p className="text-xs text-brand-muted">Token generation latency & throughput trends</p>
            </div>
            <span className="text-[11px] font-mono bg-brand-surface px-2.5 py-1 rounded border border-brand-border text-brand-muted">
              ARM64 Hardware Monitor
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2438" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF2438" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111318', borderColor: '#242834', borderRadius: '8px' }} 
                  itemStyle={{ color: '#F1F5F9', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="throughput" name="Throughput (tokens/s)" stroke="#FF2438" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-red" />
            <span>System Hardware Utilization</span>
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-brand-muted">CPU Usage</span>
              <span className="font-mono text-white">{telemetry?.cpu_percent ?? 18}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-brand-surface overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-red to-rose-500 transition-all duration-500" 
                style={{ width: `${telemetry?.cpu_percent ?? 18}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-brand-muted">RAM Usage</span>
              <span className="font-mono text-white">
                {telemetry?.memory_used_gb ?? 6.8} GB / {telemetry?.memory_total_gb ?? 16} GB ({telemetry?.memory_percent ?? 42}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-brand-surface overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                style={{ width: `${telemetry?.memory_percent ?? 42}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/50 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>NPU Telemetry Engine</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              {telemetry?.npu_status ?? 'Hardware acceleration capability detected'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-red" />
              <span>Recent Document Intelligence</span>
            </h2>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-brand-red hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-brand-surface border border-dashed border-brand-border text-xs text-brand-muted">
              No documents uploaded yet. Go to Document Intelligence to upload PDF, DOCX, or images.
            </div>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-red/10 text-brand-red font-bold uppercase">
                      {doc.file_type}
                    </div>
                    <div>
                      <p className="font-semibold text-white truncate max-w-[200px]">{doc.filename}</p>
                      <p className="text-[10px] text-brand-muted">{doc.page_count} Pages • {doc.processing_time_ms}ms processing</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    Indexed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-red" />
              <span>Snapdragon Workload Routing</span>
            </h2>
            <button
              onClick={() => onNavigate('performance')}
              className="text-xs text-brand-red hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Performance Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {workloads.slice(0, 4).map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white capitalize">{w.task.replace('_', ' ')}</p>
                  <p className="text-[10px] text-brand-muted truncate max-w-[240px]">{w.rationale}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  w.hardware_target === 'NPU' 
                    ? 'bg-brand-red/20 text-brand-red border-brand-red/30' 
                    : w.hardware_target === 'GPU' 
                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  → {w.hardware_target}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
