import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Cpu, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Settings,
  CheckCircle2
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'workspace'
  | 'documents'
  | 'models'
  | 'performance'
  | 'benchmarks'
  | 'privacy'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isArm64: boolean;
  npuStatus: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isArm64,
  npuStatus
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace' as ActiveTab, label: 'AI Workspace', icon: MessageSquare, badge: 'LOCAL' },
    { id: 'documents' as ActiveTab, label: 'Document Intelligence', icon: FileText },
    { id: 'models' as ActiveTab, label: 'Model Center', icon: Cpu },
    { id: 'performance' as ActiveTab, label: 'Performance Center', icon: Activity, badge: 'NPU' },
    { id: 'benchmarks' as ActiveTab, label: 'AI Benchmarks', icon: BarChart3 },
    { id: 'privacy' as ActiveTab, label: 'Privacy Center', icon: ShieldCheck },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-brand-surface border-r border-brand-border flex flex-col justify-between select-none">
      <div className="py-6 px-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-900/30 font-bold text-xl tracking-wider">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg text-brand-text tracking-tight">SNAPMIND</h1>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30">AI</span>
            </div>
            <p className="text-[10px] text-brand-muted font-medium tracking-wide">Intelligence. On Your PC.</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-red/10 text-brand-red border border-brand-red/30 shadow-sm'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-red' : 'text-brand-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-brand-red text-white' : 'bg-brand-subtle text-brand-muted'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 m-3 rounded-xl bg-brand-card border border-brand-border/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-brand-text">Snapdragon AI PC</span>
        </div>
        <div className="space-y-1 text-[11px] text-brand-muted">
          <div className="flex justify-between">
            <span>Architecture:</span>
            <span className="font-mono text-brand-text">{isArm64 ? 'ARM64 Native' : 'ARM64 Compatible'}</span>
          </div>
          <div className="flex justify-between">
            <span>Execution:</span>
            <span className="text-brand-red font-medium">Local Hardware</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center gap-1.5 text-[10px] text-emerald-400">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="truncate">{npuStatus || 'Hardware acceleration detected'}</span>
        </div>
      </div>
    </aside>
  );
};
