import React from 'react';
import { PredictionResult } from '../types/cardio';
import { BarChart3, TrendingUp, TrendingDown, HelpCircle, ShieldCheck } from 'lucide-react';

interface ExplainabilityViewProps {
  prediction: PredictionResult;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({
  prediction,
}) => {
  // Global feature importance weights in order of Gini importance / standardized coefficient
  const globalImportance = [
    { rank: 1, name: 'Major Vessels Fluoroscopy (ca)', weight: 0.92, clinicalRole: 'Direct radiological observation of coronary artery calcification' },
    { rank: 2, name: 'ST Depression Oldpeak (oldpeak)', weight: 0.68, clinicalRole: 'Physiological subendocardial ischemia during Bruce protocol stress' },
    { rank: 3, name: 'Thallium Scintigraphy (thal)', weight: 0.66, clinicalRole: 'Nuclear tracer perfusion revealing reversible/fixed myocardial ischemia' },
    { rank: 4, name: 'Chest Pain Type (cp)', weight: 0.64, clinicalRole: 'Symptom classification (silent/asymptomatic ischemia strongly flags multi-vessel CAD)' },
    { rank: 5, name: 'Max Exercise Heart Rate (thalach)', weight: 0.58, clinicalRole: 'Inversely proportional: High rate indicates healthy chronotropic cardiac reserve' },
    { rank: 6, name: 'Biological Sex (sex)', weight: 0.58, clinicalRole: 'Demographic baseline differences in coronary atherosclerosis manifestation' },
    { rank: 7, name: 'Exercise-Induced Angina (exang)', weight: 0.54, clinicalRole: 'Exertional symptom reproduction under graded myocardial workload' },
    { rank: 8, name: 'ST Segment Slope (slope)', weight: 0.32, clinicalRole: 'Electrophysiological recovery dynamics (downsloping/horizontal vs upsloping)' },
    { rank: 9, name: 'Resting Blood Pressure (trestbps)', weight: 0.29, clinicalRole: 'Chronic hemodynamic afterload and endothelial shear stress' },
    { rank: 10, name: 'Resting ECG Anomaly (restecg)', weight: 0.22, clinicalRole: 'Resting repolarization changes and left ventricular hypertrophy' },
    { rank: 11, name: 'Age in Years (age)', weight: 0.22, clinicalRole: 'Cumulative exposure duration to systemic cardiovascular risk factors' },
    { rank: 12, name: 'Serum Cholesterol (chol)', weight: 0.21, clinicalRole: 'Circulating atherogenic lipid substrate for vascular plaque formation' },
    { rank: 13, name: 'Fasting Blood Sugar (fbs)', weight: 0.08, clinicalRole: 'Metabolic glycemic dysregulation and microvascular endothelial impact' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Machine Learning Explainability & Feature Attributions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual SHAP-style additive feature contributions ($f(x) = E[f(x)] + \sum \phi_i$) for current patient
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Baseline Prior: ~46.0%</span>
          <span>·</span>
          <span className="text-cyan-300 font-semibold">
            Patient Log-Odds: {prediction.logOdds >= 0 ? `+${prediction.logOdds.toFixed(2)}` : prediction.logOdds.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Waterfall-style Patient Feature Contribution List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center gap-2">
          <span>Patient-Specific Factor Attribution</span>
          <span className="text-[11px] text-slate-500 font-normal">
            (Ranked by Magnitude of Influence on Diagnosis)
          </span>
        </h3>

        <div className="space-y-3">
          {[...prediction.primaryRiskDrivers, ...prediction.protectiveFactors]
            .sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
            .map((item, idx) => {
              const isRisk = item.direction === 'risk_increasing';
              const absVal = Math.abs(item.shapValue);
              // Max scale approx 2.5
              const barWidthPercent = Math.min(100, Math.round((absVal / 2.2) * 100));

              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      {isRisk ? (
                        <TrendingUp className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-200">
                        {item.featureName}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-mono text-slate-300">
                        Value: <strong className="text-slate-100">{item.patientValue}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">Ref: {item.normalRange}</span>
                      <span className="text-slate-600">|</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          isRisk ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isRisk ? `+${item.shapValue.toFixed(2)} log-odds` : `${item.shapValue.toFixed(2)} log-odds`}
                      </span>
                    </div>
                  </div>

                  {/* Visual Impact Bar */}
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        isRisk ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.clinicalSummary}
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Global Feature Importance Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Global Model Feature Importance (UCI Cleveland Benchmark)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Trained coefficient magnitude and Gini impurity reduction across 303 angiographically validated cases
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Metric: Relative Gini / Weight Coefficient
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {globalImportance.map((feat) => {
            const barWidth = Math.round((feat.weight / 1.0) * 100);
            return (
              <div
                key={feat.rank}
                className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-200">
                    <span className="font-mono text-slate-400 mr-1.5">#{feat.rank}</span>
                    {feat.name}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                    {feat.weight.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {feat.clinicalRole}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
