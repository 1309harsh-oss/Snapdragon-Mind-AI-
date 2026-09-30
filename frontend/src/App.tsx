import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Layout } from './components/layout/Layout';
import type { ActiveTab } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AIChatWorkspace } from './components/workspace/AIChatWorkspace';
import { DocumentManager } from './components/documents/DocumentManager';
import { ModelCenter } from './components/models/ModelCenter';
import { PerformanceCenter } from './components/performance/PerformanceCenter';
import { BenchmarkSuite } from './components/benchmarks/BenchmarkSuite';
import { PrivacyCenter } from './components/privacy/PrivacyCenter';
import { SettingsView } from './components/settings/SettingsView';
import { api } from './services/api';
import type { DeviceInfo } from './types';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    if (user) {
      api.getDeviceInfo().then(setDeviceInfo).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-brand-red border-t-transparent animate-spin" />
        <p className="text-xs text-brand-muted font-mono">Initializing SnapMind AI PC Engine...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard onNavigate={setActiveTab} />;
      case 'workspace':
        return <AIChatWorkspace />;
      case 'documents':
        return <DocumentManager />;
      case 'models':
        return <ModelCenter />;
      case 'performance':
        return <PerformanceCenter />;
      case 'benchmarks':
        return <BenchmarkSuite />;
      case 'privacy':
        return <PrivacyCenter />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExecutiveDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      deviceInfo={deviceInfo}
    >
      {renderActiveView()}
    </Layout>
  );
};
