import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import type { Conversation, Message, DocumentItem, AIModel } from '../../types';
import { 
  Send, 
  Plus, 
  Trash2, 
  Cpu, 
  Copy, 
  Check, 
  FileText, 
  Sparkles,
  Info,
  X
} from 'lucide-react';

export const AIChatWorkspace: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('snapmind-local-7b');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showContextPanel, setShowContextPanel] = useState<boolean>(true);
  const [activeMessageContext, setActiveMessageContext] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [convs, docs, mdls] = await Promise.all([
        api.getConversations(),
        api.getDocuments(),
        api.getModels()
      ]);
      setConversations(convs);
      setDocuments(docs);
      setModels(mdls);

      if (convs.length > 0) {
        setActiveConvId(convs[0].id);
        setMessages(convs[0].messages || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (activeConvId) {
      const conv = conversations.find(c => c.id === activeConvId);
      if (conv) {
        setMessages(conv.messages || []);
      }
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setSelectedDocIds([]);
    setActiveMessageContext(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');
    setLoading(true);

    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConvId || '',
      sender: 'user',
      content: userText,
      backend_used: 'User Input',
      latency_ms: 0,
      tokens_count: 0,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const resp = await api.sendMessage({
        message: userText,
        conversation_id: activeConvId || undefined,
        model_id: selectedModelId,
        document_ids: selectedDocIds,
        local_only: true
      });

      if (!activeConvId) {
        setActiveConvId(resp.conversation_id);
      }

      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, resp]);
      setActiveMessageContext(resp);
      
      const updatedConvs = await api.getConversations();
      setConversations(updatedConvs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      if (activeConvId === id) {
        if (updated.length > 0) {
          setActiveConvId(updated[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (err) {}
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(d => d !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 select-none">
      <div className="w-64 bg-brand-card border border-brand-border/70 rounded-2xl flex flex-col justify-between p-3">
        <div>
          <button
            onClick={handleNewConversation}
            className="w-full py-2.5 px-3 rounded-xl bg-brand-red hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-red-900/20 mb-3"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="text-[11px] font-bold text-brand-muted px-2 mb-2 uppercase tracking-wider">
            History
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
            {conversations.map(conv => {
              const isActive = activeConvId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group w-full p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-brand-surface border border-brand-red/30 text-white font-semibold' 
                      : 'text-brand-muted hover:text-white hover:bg-brand-surface/50'
                  }`}
                >
                  <span className="truncate pr-2">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-brand-muted hover:text-brand-red transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {selectedDocIds.length > 0 && (
          <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-red flex items-center justify-between">
            <span className="font-semibold">{selectedDocIds.length} Document(s) Attached</span>
            <button onClick={() => setSelectedDocIds([])} className="hover:underline text-[10px]">
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-brand-card border border-brand-border/70 rounded-2xl flex flex-col justify-between overflow-hidden">
        <div className="px-6 py-3.5 border-b border-brand-border bg-brand-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">SnapMind AI Workspace</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  ● LOCAL AI
                </span>
              </div>
              <p className="text-[10px] text-brand-muted">
                Executing via Qualcomm Snapdragon ONNX ARM64 Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="bg-brand-dark border border-brand-border text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-red"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.quantization})</option>
              ))}
            </select>

            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                showContextPanel 
                  ? 'bg-brand-red/10 border-brand-red/30 text-brand-red' 
                  : 'bg-brand-dark border-brand-border text-brand-muted'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-brand-muted my-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SnapMind AI Assistant</h3>
                <p className="text-xs max-w-sm mt-1">
                  Ask questions, summarize documents, or run semantic vector queries. All inference executes 100% locally on your Snapdragon PC.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-lg text-left pt-4">
                <button
                  onClick={() => setInputPrompt("Summarize the key architecture of Snapdragon AI PCs.")}
                  className="p-3 rounded-xl bg-brand-surface border border-brand-border/60 hover:border-brand-red/40 text-xs text-brand-text transition-all"
                >
                  "Summarize the key architecture of Snapdragon AI PCs."
                </button>
                <button
                  onClick={() => setInputPrompt("What action items are needed for local vector RAG setup?")}
                  className="p-3 rounded-xl bg-brand-surface border border-brand-border/60 hover:border-brand-red/40 text-xs text-brand-text transition-all"
                >
                  "What action items are needed for local vector RAG setup?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-brand-muted px-1">
                    <span>{isUser ? 'You' : 'SnapMind AI'}</span>
                    {!isUser && (
                      <>
                        <span>•</span>
                        <span className="text-brand-red font-semibold">{msg.backend_used}</span>
                        {msg.latency_ms > 0 && (
                          <>
                            <span>•</span>
                            <span>{msg.latency_ms}ms</span>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-brand-red text-white rounded-tr-none'
                        : 'bg-brand-surface border border-brand-border/70 text-brand-text rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-brand-muted">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-brand-dark text-emerald-400 font-mono text-[10px]">
                            LOCAL INFERENCE
                          </span>
                          {msg.sources && msg.sources.length > 0 && (
                            <span className="text-purple-400 font-medium">
                              {msg.sources.length} Context Chunks Cited
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-brand-surface border-t border-brand-border space-y-3">
          {documents.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-brand-muted font-semibold text-[11px] shrink-0">Attach Docs:</span>
              {documents.map(doc => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocumentSelection(doc.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-brand-red/20 border-brand-red text-brand-red' 
                        : 'bg-brand-dark border-brand-border text-brand-muted hover:text-white'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{doc.filename}</span>
                  </button>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask SnapMind AI anything or query attached documents..."
              className="flex-1 py-3 px-4 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="p-3 rounded-xl bg-brand-red hover:bg-red-600 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-red-900/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {showContextPanel && (
        <div className="w-72 bg-brand-card border border-brand-border/70 rounded-2xl p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-red" />
              <span>Inference Telemetry</span>
            </h3>
            <button onClick={() => setShowContextPanel(false)} className="text-brand-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-1">
              <span className="text-[10px] text-brand-muted uppercase font-bold">Execution Engine</span>
              <p className="font-semibold text-white">Snapdragon QNN ONNX</p>
              <p className="text-[10px] text-emerald-400">Qualcomm Hexagon NPU Native</p>
            </div>

            <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-1">
              <span className="text-[10px] text-brand-muted uppercase font-bold">Active Model</span>
              <p className="font-semibold text-white">SnapMind Local 7B</p>
              <p className="text-[10px] text-brand-muted">Quantization: INT4 (NPU Optimized)</p>
            </div>

            {activeMessageContext && (
              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border/50 space-y-2">
                <span className="text-[10px] text-brand-muted uppercase font-bold">Latest Response Telemetry</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-muted">Latency:</span>
                  <span className="font-mono text-white">{activeMessageContext.latency_ms} ms</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-muted">Token Estimate:</span>
                  <span className="font-mono text-white">{activeMessageContext.tokens_count} tokens</span>
                </div>
              </div>
            )}

            {activeMessageContext?.sources && activeMessageContext.sources.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-brand-muted uppercase font-bold">Retrieved Context Sources</span>
                {activeMessageContext.sources.map((src, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-brand-surface border border-brand-border/50 space-y-1 text-[11px]">
                    <div className="flex justify-between font-semibold text-purple-300">
                      <span className="truncate max-w-[130px]">{src.filename}</span>
                      <span>{(src.similarity * 100).toFixed(1)}% match</span>
                    </div>
                    <p className="text-[10px] text-brand-muted line-clamp-3">{src.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
