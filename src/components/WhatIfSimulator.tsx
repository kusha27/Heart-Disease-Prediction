import React, { useState, useMemo } from 'react';
import { PatientParameters, PredictionResult } from '../types/cardio';
import { evaluateHeartDisease } from '../ml/models';
import { Sparkles, ArrowRight, CheckCircle, HeartPulse, RefreshCw } from 'lucide-react';

interface WhatIfSimulatorProps {
  baselinePatient: PatientParameters;
  baselinePrediction: PredictionResult;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baselinePatient,
  baselinePrediction,
}) => {
  // Counterfactual editable parameters
  const [targetTrestbps, setTargetTrestbps] = useState<number>(
    Math.min(baselinePatient.trestbps, 120)
  );
  const [targetChol, setTargetChol] = useState<number>(
    Math.min(baselinePatient.chol, 180)
  );
  const [targetThalach, setTargetThalach] = useState<number>(
    Math.max(baselinePatient.thalach, 160)
  );
  const [targetExang, setTargetExang] = useState<0 | 1>(0);
  const [targetFbs, setTargetFbs] = useState<0 | 1>(0);
  const [targetOldpeak, setTargetOldpeak] = useState<number>(
    Math.min(baselinePatient.oldpeak, 0.4)
  );

  // Reset to ideal therapeutic goals
  const handleResetToIdeal = () => {
    setTargetTrestbps(118);
    setTargetChol(175);
    setTargetThalach(Math.max(baselinePatient.thalach, 165));
    setTargetExang(0);
    setTargetFbs(0);
    setTargetOldpeak(Math.min(baselinePatient.oldpeak, 0.2));
  };

  // Recompute prediction for counterfactual scenario
  const counterfactualPatient: PatientParameters = useMemo(() => {
    return {
      ...baselinePatient,
      trestbps: targetTrestbps,
      chol: targetChol,
      thalach: targetThalach,
      exang: targetExang,
      fbs: targetFbs,
      oldpeak: targetOldpeak,
    };
  }, [
    baselinePatient,
    targetTrestbps,
    targetChol,
    targetThalach,
    targetExang,
    targetFbs,
    targetOldpeak,
  ]);

  const counterfactualPrediction = useMemo(() => {
    return evaluateHeartDisease(counterfactualPatient);
  }, [counterfactualPatient]);

  const baselineRiskPercent = Math.round(baselinePrediction.probability * 100);
  const simulatedRiskPercent = Math.round(counterfactualPrediction.probability * 100);

  // Absolute Risk Reduction (ARR)
  const arr = Math.max(0, baselineRiskPercent - simulatedRiskPercent);
  // Relative Risk Reduction (RRR)
  const rrr = baselineRiskPercent > 0 ? Math.round((arr / baselineRiskPercent) * 100) : 0;
  // Number Needed to Treat (NNT)
  const nnt = arr > 0 ? Math.max(1, Math.round(100 / arr)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            Counterfactual Clinical Intervention Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate the impact of evidence-based medical therapies, lifestyle changes, and cardiac rehabilitation
          </p>
        </div>
        <button
          onClick={handleResetToIdeal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 rounded-md transition-colors font-medium self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply Guideline Ideal Targets</span>
        </button>
      </div>

      {/* Delta Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Baseline Risk
          </span>
          <div className="text-3xl font-mono font-bold text-slate-200 tabular-nums">
            {baselineRiskPercent}%
          </div>
          <span className="text-xs text-slate-400 capitalize">
            {baselinePrediction.riskTier} Stratum
          </span>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
            Simulated Post-Rx Risk
          </span>
          <div className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">
            {simulatedRiskPercent}%
          </div>
          <span className="text-xs text-cyan-300 capitalize">
            {counterfactualPrediction.riskTier} Stratum
          </span>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
            Absolute Risk Reduction (ARR)
          </span>
          <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">
            -{arr}%
          </div>
          <span className="text-xs text-slate-400">
            Relative reduction: {rrr}%
          </span>
        </div>

        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Est. Number Needed to Treat
          </span>
          <div className="text-3xl font-mono font-bold text-slate-200 tabular-nums">
            {nnt ? `~${nnt}` : 'N/A'}
          </div>
          <span className="text-xs text-slate-400">
            Patients treated to prevent 1 CAD event
          </span>
        </div>
      </div>

      {/* Interactive Intervention Rails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Intervention Group 1: Hemodynamics & Lipids */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Pharmacotherapy & Metabolic Interventions
          </h3>

          {/* Blood Pressure Control */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">
                Systolic BP Optimization (Antihypertensive Rx)
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 line-through tabular-nums">
                  {baselinePatient.trestbps}
                </span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-semibold tabular-nums">
                  {targetTrestbps} mmHg
                </span>
              </div>
            </div>
            <input
              type="range"
              min={95}
              max={190}
              step={2}
              value={targetTrestbps}
              onChange={(e) => setTargetTrestbps(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ACC/AHA Target: &lt; 120/80 mmHg with ACE-i, ARB, or CCB regimen
            </p>
          </div>

          {/* Cholesterol Lowering (Statins / PCSK9i) */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">
                Serum Cholesterol Lowering (High-Intensity Statin)
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 line-through tabular-nums">
                  {baselinePatient.chol}
                </span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-semibold tabular-nums">
                  {targetChol} mg/dL
                </span>
              </div>
            </div>
            <input
              type="range"
              min={120}
              max={380}
              step={5}
              value={targetChol}
              onChange={(e) => setTargetChol(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Atorvastatin 40-80mg or Rosuvastatin 20-40mg achieves ≥50% LDL-C reduction
            </p>
          </div>

          {/* Glycemic Normalization */}
          <div>
            <span className="block text-xs font-medium text-slate-300 mb-1.5">
              Glycemic Control (Target FBS ≤ 120 mg/dL)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetFbs(0)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  targetFbs === 0
                    ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Normal (≤ 120 mg/dL)
              </button>
              <button
                type="button"
                onClick={() => setTargetFbs(1)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  targetFbs === 1
                    ? 'bg-amber-950/60 border-amber-500/70 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Elevated (&gt; 120 mg/dL)
              </button>
            </div>
          </div>
        </div>

        {/* Intervention Group 2: Cardiac Rehab & Exercise Capacity */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Exercise Rehabilitation & Ischemia Relief
          </h3>

          {/* Exercise Capacity / Max Heart Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">
                Peak Exercise Capacity (Max Heart Rate)
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 line-through tabular-nums">
                  {baselinePatient.thalach}
                </span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-semibold tabular-nums">
                  {targetThalach} bpm
                </span>
              </div>
            </div>
            <input
              type="range"
              min={80}
              max={200}
              value={targetThalach}
              onChange={(e) => setTargetThalach(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supervised 12-week aerobic cardiac training expands chronotropic capacity
            </p>
          </div>

          {/* Exercise Angina Relief */}
          <div>
            <span className="block text-xs font-medium text-slate-300 mb-1.5">
              Exertional Angina Relief (Anti-anginal Rx / Revascularization)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetExang(0)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  targetExang === 0
                    ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                No Angina (Asymptomatic)
              </button>
              <button
                type="button"
                onClick={() => setTargetExang(1)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  targetExang === 1
                    ? 'bg-rose-950/60 border-rose-500/70 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Angina Provoked
              </button>
            </div>
          </div>

          {/* ST Segment Depression Recovery */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">
                Exercise ST Depression (Oldpeak)
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 line-through tabular-nums">
                  {baselinePatient.oldpeak.toFixed(1)}
                </span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-semibold tabular-nums">
                  {targetOldpeak.toFixed(1)} mm
                </span>
              </div>
            </div>
            <input
              type="range"
              min={0.0}
              max={4.0}
              step={0.1}
              value={targetOldpeak}
              onChange={(e) => setTargetOldpeak(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Improved myocardial perfusion reduces exercise-induced ST depression
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
