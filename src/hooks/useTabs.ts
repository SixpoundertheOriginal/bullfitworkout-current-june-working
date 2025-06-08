
import { useState, useCallback } from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface UseTabsOptions {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const useTabs = (tabs: TabItem[], options: UseTabsOptions = {}) => {
  const { defaultTab, onTabChange } = options;
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const changeTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    }
  }, [tabs, onTabChange]);

  const getActiveTab = useCallback(() => {
    return tabs.find(t => t.id === activeTab);
  }, [tabs, activeTab]);

  const nextTab = useCallback(() => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    changeTab(tabs[nextIndex].id);
  }, [tabs, activeTab, changeTab]);

  const prevTab = useCallback(() => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    changeTab(tabs[prevIndex].id);
  }, [tabs, activeTab, changeTab]);

  return {
    activeTab,
    changeTab,
    getActiveTab,
    nextTab,
    prevTab
  };
};
