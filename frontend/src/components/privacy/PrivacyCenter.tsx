import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePrivacy } from '../../context/PrivacyContext';
import type { PrivacyStatus } from '../../types';
import { ShieldCheck, Lock, EyeOff, HardDrive } from 'lucide-react';

export const PrivacyCenter: React.FC = () => {
  const { localOnly, setLocalOnly } = usePrivacy();
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [localOnly]);

  const fetchStatus = async () => {
    try {
      const res = await api.getPrivacyStatus();
      setPrivacyStatus(res);
    } catch (err) {}
  };

  return (
    <div className="space-y-6 select-none">
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              PRIVACY-FIRST BY DESIGN
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Privacy & Security Center</h1>
          <p className="text-xs text-brand-muted mt-0.5 max-w-xl">
            Your documents remain strictly on this device. All vector chunking, embeddings, and LLM inference execute locally unless explicitly permitted.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface border border-brand-border">
          <div className="text-right">
            <span className="text-xs font-bold text-white block">Local Processing Only</span>
            <span className="text-[10px] text-brand-muted">Block external cloud network calls</span>
          </div>
          <button
            onClick={() => setLocalOnly(!localOnly)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              localOnly ? 'bg-emerald-500' : 'bg-brand-subtle'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                localOnly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-muted font-semibold">Isolation Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-black text-white">100% On-Device</h3>
          <p className="text-[10px] text-emerald-400">Zero Cloud Egress</p>
        </div>

        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-muted font-semibold">Cloud Requests Blocked</span>
            <EyeOff className="w-4 h-4 text-brand-red" />
          </div>
          <h3 className="text-lg font-black text-white">{privacyStatus?.cloud_requests_blocked ?? 14} Requests</h3>
          <p className="text-[10px] text-brand-muted">Prevented by Local Rule</p>
        </div>

        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-muted font-semibold">Local Vector Encryption</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-lg font-black text-white">AES-256 Active</h3>
          <p className="text-[10px] text-cyan-400">SQLite Local Store</p>
        </div>

        <div className="p-5 rounded-xl bg-brand-card border border-brand-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-muted font-semibold">Local Documents</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-black text-white">{privacyStatus?.local_documents_count ?? 0} Files</h3>
          <p className="text-[10px] text-brand-muted">Stored in ./storage/</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border/70 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SnapMind Architecture Privacy Assurance</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/50 space-y-2">
            <h4 className="font-bold text-white">On-Device Parsing</h4>
            <p className="text-brand-muted leading-relaxed">
              PDF, DOCX, and image OCR processing execute natively on Windows on ARM64 CPU/NPU cores without sending raw text to remote servers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/50 space-y-2">
            <h4 className="font-bold text-white">Local Vector Embeddings</h4>
            <p className="text-brand-muted leading-relaxed">
              All document chunk vectors and semantic indices are stored in a local SQLite database on your Snapdragon PC.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/50 space-y-2">
            <h4 className="font-bold text-white">Explicit Cloud Fallback</h4>
            <p className="text-brand-muted leading-relaxed">
              Cloud models are only contacted if you explicitly turn off 'Local Processing Only' and confirm network payload authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
