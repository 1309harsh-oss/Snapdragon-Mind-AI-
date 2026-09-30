import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface PrivacyContextType {
  localOnly: boolean;
  setLocalOnly: (val: boolean) => Promise<void>;
  privacyBadge: string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localOnly, setLocalOnlyState] = useState<boolean>(true);
  const [privacyBadge, setPrivacyBadge] = useState<string>('Privacy-First Local Isolation Active');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getPrivacyStatus();
        setLocalOnlyState(res.local_processing_only);
        setPrivacyBadge(res.privacy_badge);
      } catch (err) {
        // Fallback
      }
    };
    fetchStatus();
  }, []);

  const setLocalOnly = async (val: boolean) => {
    setLocalOnlyState(val);
    try {
      const res = await api.updatePrivacySettings(val);
      setPrivacyBadge(res.privacy_badge);
    } catch (err) {
      // Fallback update
    }
  };

  return (
    <PrivacyContext.Provider value={{ localOnly, setLocalOnly, privacyBadge }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) throw new Error('usePrivacy must be used within PrivacyProvider');
  return context;
};
