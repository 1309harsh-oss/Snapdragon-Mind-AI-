import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { api } from '../../services/api';
import { 
  Settings, 
  Sun, 
  Moon, 
  Cpu, 
  Terminal, 
  User as UserIcon
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { localOnly, setLocalOnly } = usePrivacy();
  const [diagOutput, setDiagOutput] = useState<string | null>(null);
  const [runningDiag, setRunningDiag] = useState(false);

  const runDiagnostics = async () => {
    setRunningDiag(true);
    setDiagOutput('Running ARM64 & Snapdragon hardware diagnostics...');
    try {
      const dev = await api.getDeviceInfo();
      const tel = await api.getTelemetry();
      const output = `============================================================
        SNAPMIND AI — SYSTEM DIAGNOSTIC REPORT        
============================================================
Operating System           : ${dev.os_system} ${dev.os_release}
System Architecture        : ${dev.architecture}
Processor Information      : ${dev.processor}
Python Runtime Architecture: ${dev.python_arch}
ARM64 Architecture Detected : ${dev.is_arm64 ? 'YES (Native ARM64)' : 'x86_64 Host'}
Total System Memory        : ${tel.memory_total_gb} GB
------------------------------------------------------------
AI Runtime (ONNX Runtime)  : Active
Available Execution Providers: ${dev.onnx_providers.join(', ')}
NPU Capability Detection   : ${dev.npu_status}
GPU Capability Detection   : ${dev.hardware_acceleration}
Local Inference Engine     : Ready
============================================================
Diagnostic execution completed successfully.`;
      setDiagOutput(output);
    } catch (err: any) {
      setDiagOutput(`Diagnostic failed: ${err.message}`);
    } finally {
      setRunningDiag(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl select-none">
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Settings & System Diagnostics</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Configure application appearance, processing preferences, and run ARM64 diagnostics.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-brand-red" />
          <span>User Account</span>
        </h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/50">
            <span className="text-brand-muted block text-[10px]">Full Name</span>
            <span className="font-bold text-white text-sm">{user?.full_name}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/50">
            <span className="text-brand-muted block text-[10px]">Email Address</span>
            <span className="font-bold text-white text-sm">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand-red" />
          <span>Appearance & Theme</span>
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand-surface border border-brand-border/50 text-xs">
          <div>
            <span className="font-bold text-white block">Theme Selection</span>
            <span className="text-brand-muted">Switch between Dark and Light mode</span>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-brand-dark border border-brand-border text-white font-bold flex items-center gap-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            <span className="capitalize">{theme} Mode</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-red" />
          <span>AI Processing & Hardware Strategy</span>
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-brand-surface border border-brand-border/50 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Local Processing Only</span>
              <span className="text-brand-muted">Strictly execute all LLM and embedding operations on-device</span>
            </div>
            <input
              type="radio"
              name="processing"
              checked={localOnly}
              onChange={() => setLocalOnly(true)}
              className="accent-brand-red"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-brand-surface border border-brand-border/50 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Cloud Fallback Allowed</span>
              <span className="text-brand-muted">Allow external cloud API gateway when local models are unavailable</span>
            </div>
            <input
              type="radio"
              name="processing"
              checked={!localOnly}
              onChange={() => setLocalOnly(false)}
              className="accent-brand-red"
            />
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>ARM64 System Diagnostics</span>
          </h2>
          <button
            onClick={runDiagnostics}
            disabled={runningDiag}
            className="px-4 py-2 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/40 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Run Diagnostics (diagnostics.py)</span>
          </button>
        </div>

        {diagOutput && (
          <div className="p-4 rounded-xl bg-brand-dark border border-brand-border font-mono text-xs text-brand-text whitespace-pre-wrap max-h-64 overflow-y-auto">
            {diagOutput}
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-red text-white flex items-center justify-center font-bold text-xs">S</div>
          <h2 className="font-extrabold text-sm text-white">SnapMind AI</h2>
        </div>
        <p className="text-brand-muted font-medium italic">"Intelligence. On Your PC."</p>
        <p className="text-brand-muted leading-relaxed">
          An AI PC productivity platform designed around local intelligence, privacy, and hardware-aware processing.
        </p>

        <div className="pt-2 border-t border-brand-border/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-brand-muted">
          <div><strong className="text-white block">Platform:</strong> Windows on ARM64</div>
          <div><strong className="text-white block">Target PC:</strong> Snapdragon HP PCs</div>
          <div><strong className="text-white block">Backend:</strong> FastAPI / Py3.13</div>
          <div><strong className="text-white block">Frontend:</strong> React / TS / Vite</div>
        </div>
      </div>
    </div>
  );
};
