'use client';

import React from 'react';
import { MessageSquareText, Activity, Lightbulb } from 'lucide-react';

export type NavTab = 'assistant' | 'airquality' | 'insights';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'assistant' as NavTab,
      label: 'AI Assistant',
      icon: MessageSquareText,
      badge: 'Smart'
    },
    {
      id: 'airquality' as NavTab,
      label: 'Air Quality',
      icon: Activity,
      badge: 'Live'
    },
    {
      id: 'insights' as NavTab,
      label: 'Solutions',
      icon: Lightbulb,
      badge: 'Impact'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-bottom-nav pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 select-none ${
                isActive ? 'text-brand-700 font-bold scale-105' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              </div>

              <span className="text-[11px] tracking-tight mt-0.5">{tab.label}</span>

              {isActive && (
                <span className="absolute bottom-1 w-8 h-0.5 bg-brand-700 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
