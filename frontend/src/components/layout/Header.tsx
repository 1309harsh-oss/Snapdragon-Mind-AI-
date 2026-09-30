import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sun, 
  Moon, 
  LogOut, 
  Cpu
} from 'lucide-react';

interface HeaderProps {
  npuStatus?: string;
  demoMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ demoMode }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { localOnly, setLocalOnly } = usePrivacy();

  return (
    <header className="h-16 bg-brand-surface border-b border-brand-border px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-card border border-brand-border text-xs">
          <Cpu className="w-4 h-4 text-brand-red" />
          <span className="font-semibold text-brand-text">Snapdragon Optimization Engine</span>
          <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
            ● LOCAL AI
          </span>
        </div>

        {demoMode && (
          <div className="px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse">
            DEMO MODE — Simulated Hardware Telemetry
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocalOnly(!localOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            localOnly
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-400 hover:bg-amber-900/40'
          }`}
          title={localOnly ? 'Local Processing Only: Documents stay 100% on PC' : 'Cloud Fallback Allowed'}
        >
          {localOnly ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{localOnly ? 'Local Processing Only' : 'Cloud Fallback Active'}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-brand-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand-text font-bold text-xs border border-brand-border">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-brand-text leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-brand-muted truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-brand-muted hover:text-brand-red rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
