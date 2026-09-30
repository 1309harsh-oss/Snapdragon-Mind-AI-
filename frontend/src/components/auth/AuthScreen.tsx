import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Cpu, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, fullName, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-between p-8 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-900/30 font-extrabold text-xl">
            S
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white">SNAPMIND <span className="text-brand-red">AI</span></h1>
            <p className="text-xs text-brand-muted font-medium">Optimized for Snapdragon-powered HP PCs</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-card border border-brand-border text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Windows on ARM64 Native</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto py-8 z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Next-Gen AI PC Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Intelligence. <br />
            <span className="bg-gradient-to-r from-brand-red via-red-500 to-rose-400 bg-clip-text text-transparent">
              On Your PC.
            </span>
          </h1>

          <p className="text-base text-brand-muted leading-relaxed max-w-lg">
            A privacy-first, hardware-aware AI productivity platform designed specifically for Snapdragon-powered HP PCs running Windows on ARM64. Run intelligent RAG, document synthesis, and vector search completely locally.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/60">
              <Cpu className="w-6 h-6 text-brand-red mb-2" />
              <h3 className="font-bold text-sm text-white">Snapdragon NPU</h3>
              <p className="text-xs text-brand-muted">Hardware-routed CPU/GPU/NPU acceleration.</p>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/60">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-sm text-white">100% Local Privacy</h3>
              <p className="text-xs text-brand-muted">Documents and embeddings never leave your device.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto glass-card p-8 rounded-2xl border border-brand-border shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              {isRegister
                ? 'Register to initialize your local Snapdragon workspace'
                : 'Sign in to access your hardware-accelerated workspace'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Snapdragon Engineer"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@qualcomm.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Initializing Local Workspace...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Workspace' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-brand-muted hover:text-brand-red font-medium transition-colors"
            >
              {isRegister
                ? 'Already have a workspace? Sign in'
                : "Don't have an account? Create workspace"}
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-brand-muted z-10">
        <p>Optimized for Snapdragon-powered HP PCs running Windows on ARM64</p>
      </footer>
    </div>
  );
};
