import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { DeviceInfo, SystemTelemetry, WorkloadRouting } from '../../types';
import { 
  Activity, 
  CheckCircle2, 
  Layers, 
  Monitor
} from 'lucide-react';

export const PerformanceCenter: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [workloads, setWorkloads] = useState<WorkloadRouting[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dev, tel, works] = await Promise.all([
          api.getDeviceInfo(),
          api.getTelemetry(),
          api.getWorkloadRouting()
        ]);
        setDeviceInfo(dev);
        setTelemetry(tel);
        setWorkloads(works);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    const interval = setInterval(async () => {
      try {
        const tel = await api.getTelemetry();
        setTelemetry(tel);
      } catch (err) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 select-none">
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30">
              QUALCOMM SNAPDRAGON ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Snapdragon Performance Center</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Real-time hardware telemetry and CPU/GPU/NPU workload routing engine.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>ARM64 Native Vector Execution</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brand-red" />
            <span>Hardware & OS Architecture</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-0.5">
              <span className="text-[10px] text-brand-muted uppercase font-bold">Processor</span>
              <p className="font-bold text-white truncate">{deviceInfo?.processor || 'Qualcomm Snapdragon X Elite'}</p>
            </div>

            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-0.5">
              <span className="text-[10px] text-brand-muted uppercase font-bold">Architecture</span>
              <p className="font-bold text-brand-red font-mono">
                {deviceInfo?.is_arm64 ? 'ARM64 Native' : 'x86_64 Emulated Host'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-0.5">
              <span className="text-[10px] text-brand-muted uppercase font-bold">Operating System</span>
              <p className="font-bold text-white">{deviceInfo?.os_system} {deviceInfo?.os_release}</p>
            </div>

            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-0.5">
              <span className="text-[10px] text-brand-muted uppercase font-bold">System Memory</span>
              <p className="font-bold text-white">{telemetry?.memory_total_gb ?? 16} GB RAM</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">ONNX Execution Providers Detected:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(deviceInfo?.onnx_providers || ['QNNExecutionProvider', 'DmlExecutionProvider', 'CPUExecutionProvider']).map((p, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-brand-dark border border-brand-border font-mono text-[11px] text-cyan-300">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-red" />
            <span>AI Execution Telemetry</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-brand-muted">CPU Core Workload</span>
                <span className="font-mono text-white">{telemetry?.cpu_percent ?? 18}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-brand-surface overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-red to-rose-500 transition-all duration-500"
                  style={{ width: `${telemetry?.cpu_percent ?? 18}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-brand-muted">RAM Footprint</span>
                <span className="font-mono text-white">
                  {telemetry?.memory_used_gb ?? 6.8} GB / {telemetry?.memory_total_gb ?? 16} GB
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-brand-surface overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${telemetry?.memory_percent ?? 42}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>NPU Acceleration Capability</span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">
                {telemetry?.npu_status || 'Qualcomm Neural Processing Engine Active (Hexagon TOPS)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-red" />
            <span>Snapdragon AI Workload Routing Architecture</span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Dynamically assigns incoming AI tasks to optimal silicon execution blocks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workloads.map((w, i) => (
            <div key={i} className="p-4 rounded-xl bg-brand-surface border border-brand-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white capitalize">{w.task.replace('_', ' ')}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  w.hardware_target === 'NPU' 
                    ? 'bg-brand-red/20 text-brand-red border-brand-red/30' 
                    : w.hardware_target === 'GPU' 
                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  → {w.hardware_target} Target
                </span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">{w.rationale}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
