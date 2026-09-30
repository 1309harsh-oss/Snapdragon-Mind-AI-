import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { AIModel } from '../../types';
import { Cpu, Play, Square, HardDrive } from 'lucide-react';

export const ModelCenter: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const data = await api.getModels();
      setModels(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLoad = async (modelId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await api.loadModel(modelId);
      }
      await fetchModels();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 select-none">
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Model Center</h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage local ONNX/ARM64 quantized models and execution hardware backends.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold">
          <Cpu className="w-4 h-4" />
          <span>Qualcomm Hexagon NPU Runtime Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map(model => (
          <div
            key={model.id}
            className={`p-6 rounded-2xl bg-brand-card border transition-all space-y-4 ${
              model.is_active 
                ? 'border-brand-red/60 shadow-lg shadow-red-900/10' 
                : 'border-brand-border/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  {model.model_type}
                </span>
                <h3 className="text-lg font-black text-white">{model.name}</h3>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                model.is_active 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                  : 'bg-brand-surface text-brand-muted border-brand-border'
              }`}>
                {model.is_active ? '● Loaded in VRAM' : 'Standby'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-brand-surface border border-brand-border/60 text-xs">
              <div>
                <span className="text-brand-muted block text-[10px]">Quantization</span>
                <span className="font-semibold text-white">{model.quantization}</span>
              </div>
              <div>
                <span className="text-brand-muted block text-[10px]">Context Window</span>
                <span className="font-semibold text-white">{model.context_length} tokens</span>
              </div>
              <div>
                <span className="text-brand-muted block text-[10px]">Hardware Backend</span>
                <span className="font-semibold text-brand-red">{model.backend}</span>
              </div>
              <div>
                <span className="text-brand-muted block text-[10px]">Model Footprint</span>
                <span className="font-semibold text-white">{model.size_gb} GB</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-brand-muted flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>{model.is_local ? '100% Local ONNX Storage' : 'Remote API Gateway'}</span>
              </span>

              <button
                onClick={() => handleToggleLoad(model.id, !model.is_active)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  model.is_active
                    ? 'bg-brand-surface text-brand-muted hover:text-white border border-brand-border'
                    : 'bg-brand-red hover:bg-red-600 text-white shadow-md shadow-red-900/20'
                }`}
              >
                {model.is_active ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Unload Model</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Load into NPU</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
