import React from 'react';
import { Sidebar } from './Sidebar';
import type { ActiveTab } from './Sidebar';
import { Header } from './Header';
import type { DeviceInfo } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  deviceInfo?: DeviceInfo | null;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  deviceInfo
}) => {
  return (
    <div className="flex h-screen bg-brand-dark overflow-hidden font-sans text-brand-text">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isArm64={deviceInfo?.is_arm64 ?? true}
        npuStatus={deviceInfo?.npu_status ?? 'Qualcomm Snapdragon Hardware Acceleration'}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          npuStatus={deviceInfo?.npu_status}
          demoMode={deviceInfo?.demo_mode}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-brand-dark">
          {children}
        </main>

        <footer className="h-7 bg-brand-surface border-t border-brand-border px-6 flex items-center justify-between text-[11px] text-brand-muted">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-brand-text">SnapMind AI v1.0</span>
            <span>•</span>
            <span>Optimized for Snapdragon-powered HP PCs</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Windows on ARM64</span>
          </div>
          <div>
            <span>100% Privacy-First Architecture</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
