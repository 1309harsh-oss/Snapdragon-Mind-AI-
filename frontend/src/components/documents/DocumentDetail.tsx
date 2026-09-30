import React, { useState } from 'react';
import { api } from '../../services/api';
import type { DocumentItem } from '../../types';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckSquare, 
  Tag, 
  Search, 
  Send,
  FileText,
  Trash2
} from 'lucide-react';

interface DocumentDetailProps {
  document: DocumentItem;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onBack, onDelete }) => {
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.queryDocument(document.id, queryInput.trim());
      setQueryResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </button>

        <button
          onClick={() => onDelete(document.id)}
          className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Document</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center font-bold text-lg uppercase">
            {document.file_type}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{document.filename}</h1>
            <div className="flex items-center gap-3 text-xs text-brand-muted mt-1">
              <span>{document.page_count} Pages</span>
              <span>•</span>
              <span>{(document.file_size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="text-emerald-400">Processing Time: {document.processing_time_ms} ms</span>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          ● VECTOR INDEXED & READY
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-red" />
              <span>Executive Summary</span>
            </h2>
            <p className="text-sm text-brand-text leading-relaxed bg-brand-surface p-4 rounded-xl border border-brand-border/60">
              {document.summary || 'No summary available.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-red" />
              <span>Query Document with Local RAG</span>
            </h2>

            <form onSubmit={handleQuery} className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask specific questions about this document..."
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red"
              />
              <button
                type="submit"
                disabled={loading || !queryInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </form>

            {queryResult && (
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/70 space-y-3">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span className="font-semibold text-brand-red">Backend: {queryResult.backend_used}</span>
                  <span>Latency: {queryResult.processing_time_ms} ms</span>
                </div>
                <div className="text-sm text-white leading-relaxed">{queryResult.answer}</div>
              </div>
            )}
          </div>

          {document.action_items && document.action_items.length > 0 && (
            <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Extracted Action Items</span>
              </h2>
              <div className="space-y-2">
                {document.action_items.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 text-xs text-brand-text flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {document.entities && document.entities.length > 0 && (
            <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>Key Identified Entities</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {document.entities.map((e, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs text-brand-text">
                    <strong className="text-cyan-400">{e.entity}</strong> <span className="text-[10px] text-brand-muted">({e.type})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-muted" />
              <span>Extracted Text Preview</span>
            </h2>
            <div className="p-3 rounded-xl bg-brand-dark border border-brand-border text-xs font-mono text-brand-muted max-h-60 overflow-y-auto whitespace-pre-wrap">
              {document.extracted_text_preview || 'No preview available.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
