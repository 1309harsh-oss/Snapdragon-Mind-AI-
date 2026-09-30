import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { DocumentItem } from '../../types';
import { DocumentDetail } from './DocumentDetail';
import { 
  UploadCloud, 
  FileText, 
  Search, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    setUploadStage('Uploading document to local workspace...');

    try {
      setTimeout(() => setUploadStage('Extracting text & running OCR...'), 400);
      setTimeout(() => setUploadStage('Computing ARM64 vector embeddings...'), 900);
      setTimeout(() => setUploadStage('Indexing into SQLite Vector DB...'), 1400);

      const doc = await api.uploadDocument(file);
      setUploadStage('Complete!');
      await fetchDocuments();
      setSelectedDocument(doc);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadStage('');
      }, 500);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    } catch (err) {}
  };

  if (selectedDocument) {
    return (
      <DocumentDetail
        document={selectedDocument}
        onBack={() => setSelectedDocument(null)}
        onDelete={handleDeleteDocument}
      />
    );
  }

  const filteredDocs = documents.filter(d => 
    d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Document Intelligence</h1>
          <p className="text-xs text-brand-muted mt-1">
            Upload PDF, DOCX, TXT, CSV, JSON, or image files for hardware-accelerated OCR, vector chunking, and semantic RAG.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Data Isolation Active</span>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-brand-card border-2 border-dashed border-brand-border hover:border-brand-red/50 transition-colors text-center relative overflow-hidden">
        {uploading ? (
          <div className="py-6 space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-brand-red border-t-transparent animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-white">{uploadStage}</h3>
            <p className="text-xs text-brand-muted">Executing locally via Snapdragon ARM64 Optimization Engine</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Drop your documents here, or browse</h3>
              <p className="text-xs text-brand-muted mt-1">
                Supports PDF, DOCX, TXT, CSV, JSON, PNG, JPG (up to 50MB)
              </p>
            </div>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e.target.files)}
              accept=".pdf,.txt,.docx,.csv,.json,.png,.jpg,.jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-red" />
            <span>Indexed Document Library ({documents.length})</span>
          </h2>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full py-2 pl-9 pr-4 rounded-xl bg-brand-card border border-brand-border text-white text-xs focus:outline-none focus:border-brand-red"
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-brand-card border border-brand-border text-xs text-brand-muted space-y-2">
            <FileText className="w-8 h-8 text-brand-muted mx-auto opacity-50" />
            <p>No documents found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className="p-5 rounded-2xl bg-brand-card border border-brand-border/70 hover:border-brand-red/40 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-red/10 text-brand-red border border-brand-red/30 text-xs font-bold uppercase">
                    {doc.file_type}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                    ● INDEXED
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-brand-red transition-colors truncate">
                    {doc.filename}
                  </h3>
                  <p className="text-xs text-brand-muted line-clamp-2 mt-1">
                    {doc.summary || 'Document ready for RAG querying.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-brand-muted">
                  <span>{doc.page_count} Pages • {(doc.file_size / 1024).toFixed(0)} KB</span>
                  <div className="flex items-center gap-1 text-white font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
