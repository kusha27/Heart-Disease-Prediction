import React from 'react';
import { Activity, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'diagnostic' | 'explainability' | 'whatif' | 'benchmarks' | 'cohort';
  onSelectTab: (tab: 'diagnostic' | 'explainability' | 'whatif' | 'benchmarks' | 'cohort') => void;
  onOpenReport: () => void;
  riskTier: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 transition-colors no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Zone (Single text element wordmark with icon) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            CardioML Diagnostic Suite
          </span>
        </div>

        {/* Zone 2: Navigation Links (4-5 single line text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('diagnostic')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'diagnostic'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostic Lab
          </button>
          <button
            onClick={() => onSelectTab('explainability')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'explainability'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SHAP Explainability
          </button>
          <button
            onClick={() => onSelectTab('whatif')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'whatif'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            What-If Simulator
          </button>
          <button
            onClick={() => onSelectTab('benchmarks')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'benchmarks'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Benchmarks
          </button>
          <button
            onClick={() => onSelectTab('cohort')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'cohort'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cleveland Cohort
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Clinical Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
