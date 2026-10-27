import React from 'react';
import { ClinicalCaseArchetype } from '../types/cardio';
import { CLINICAL_ARCHETYPES } from '../ml/dataset';
import { UserCheck } from 'lucide-react';

interface ArchetypeSelectorProps {
  selectedId: string | null;
  onSelectArchetype: (archetype: ClinicalCaseArchetype) => void;
}

export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
  selectedId,
  onSelectArchetype,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Clinical Benchmark Patient Archetypes
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Load verified patient profiles to test model sensitivity
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {CLINICAL_ARCHETYPES.map((arch) => {
          const isSelected = selectedId === arch.id;
          return (
            <button
              key={arch.id}
              onClick={() => onSelectArchetype(arch)}
              className={`text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {arch.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 line-clamp-1 font-mono">
                {arch.subtitle}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="text-slate-300">Target:</span>
                <span
                  className={
                    arch.trueDiagnosis === 'Coronary Artery Disease'
                      ? 'text-rose-400 font-medium'
                      : 'text-emerald-400 font-medium'
                  }
                >
                  {arch.trueDiagnosis === 'Coronary Artery Disease' ? 'CAD Present' : 'Normal / Non-CAD'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
