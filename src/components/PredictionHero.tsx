import React from 'react';
import { PredictionResult } from '../types/cardio';
import { AlertTriangle, CheckCircle2, Sliders, ShieldAlert, GitFork } from 'lucide-react';

interface PredictionHeroProps {
  prediction: PredictionResult;
  selectedModel: 'ensemble' | 'logistic' | 'randomForest' | 'svm' | 'ascvd';
  onSelectModel: (m: 'ensemble' | 'logistic' | 'randomForest' | 'svm' | 'ascvd') => void;
  threshold: number;
  onThresholdChange: (val: number) => void;
}

export const PredictionHero: React.FC<PredictionHeroProps> = ({
  prediction,
  selectedModel,
  onSelectModel,
  threshold,
  onThresholdChange,
}) => {
  const percent = Math.round(prediction.probability * 100);
  const ciLowPercent = Math.round(prediction.confidenceInterval[0] * 100);
  const ciHighPercent = Math.round(prediction.confidenceInterval[1] * 100);

  // Status color mappings
  const getStatusTheme = (tier: string) => {
    switch (tier) {
      case 'critical':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-950/40',
          border: 'border-rose-500/50',
          gaugeColor: '#f43f5e',
          badgeText: 'Critical CAD Risk (High Stenosis Probability)',
        };
      case 'high':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/50',
          gaugeColor: '#f59e0b',
          badgeText: 'High Cardiovascular Risk Profile',
        };
      case 'moderate':
        return {
          text: 'text-yellow-300',
          bg: 'bg-yellow-950/30',
          border: 'border-yellow-500/40',
          gaugeColor: '#eab308',
          badgeText: 'Intermediate CAD Risk Profile',
        };
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-500/40',
          gaugeColor: '#10b981',
          badgeText: 'Low Cardiovascular Disease Probability',
        };
    }
  };

  const theme = getStatusTheme(prediction.riskTier);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 mb-6">
      {/* Top row: Model selector and threshold calibration */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Active Classifier:
          </span>
          <div className="flex flex-wrap gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              onClick={() => onSelectModel('ensemble')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedModel === 'ensemble'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Consensus Ensemble
            </button>
            <button
              onClick={() => onSelectModel('logistic')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedModel === 'logistic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Logistic Regression
            </button>
            <button
              onClick={() => onSelectModel('randomForest')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedModel === 'randomForest'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Random Forest
            </button>
            <button
              onClick={() => onSelectModel('svm')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedModel === 'svm'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SVM (RBF)
            </button>
            <button
              onClick={() => onSelectModel('ascvd')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedModel === 'ascvd'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ACC/AHA ASCVD
            </button>
          </div>
        </div>

        {/* Operating decision threshold scrubber */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <label htmlFor="classification-threshold" className="font-mono">Threshold:</label>
          </div>
          <input
            id="classification-threshold"
            type="range"
            min={0.15}
            max={0.85}
            step={0.05}
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className="w-24 accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs font-semibold text-slate-200 tabular-nums">
            {(threshold * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Main split display: Risk Gauge & Coronary Anatomy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Column: Gauge & Core Risk Metrics (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${theme.text}`}>
                {theme.badgeText}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                Odds Ratio: {prediction.oddsRatio}x
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className={`text-5xl font-mono font-bold tracking-tight tabular-nums ${theme.text}`}>
                {percent}%
              </span>
              <div className="text-xs text-slate-400">
                <div className="font-medium text-slate-200">
                  Predicted Probability of Obstructive CAD
                </div>
                <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                  95% Confidence Interval: [{ciLowPercent}% – {ciHighPercent}%]
                </div>
              </div>
            </div>

            {/* Visual Risk Gauge Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-3 my-3 overflow-hidden relative border border-slate-700/50">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percent}%`,
                  backgroundColor: theme.gaugeColor,
                }}
              />
              {/* Decision threshold indicator line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-sm z-10"
                style={{ left: `${threshold * 100}%` }}
                title={`Operating Decision Threshold: ${(threshold * 100).toFixed(0)}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-4">
              <span>0% Low Risk</span>
              <span>20% Moderate</span>
              <span>50% High Risk</span>
              <span>75% Critical</span>
              <span>100%</span>
            </div>
          </div>

          {/* Clinical Binary Action Recommendation & Stratum */}
          <div className={`p-3.5 rounded-lg border ${theme.bg} ${theme.border} flex items-start gap-3`}>
            {prediction.binaryClassification === 1 ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span>
                  {prediction.binaryClassification === 1
                    ? 'CAD Positive Classification (Exceeds Threshold)'
                    : 'CAD Negative / Low Suspicion Classification'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  [Operating Cutoff: {(threshold * 100).toFixed(0)}%]
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {prediction.binaryClassification === 1
                  ? 'Strong physiological indication of coronary artery disease (>50% luminal stenosis). Diagnostic confirmation recommended via coronary computed tomography angiography (CCTA) or invasive coronary angiography.'
                  : 'Electrophysiological and exercise parameters align with low probability of significant flow-limiting coronary artery stenosis. Maintain primary prevention lifestyle and routine risk surveillance.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Coronary Anatomy Context & Multi-Model Consensus (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-cyan-400" />
              Coronary Arterial Tree Reference
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              LAD · LCx · RCA
            </span>
          </div>

          {/* Anatomical Visualization Frame */}
          <div className="my-2.5 rounded-md overflow-hidden border border-slate-800/80 bg-slate-900/60 relative aspect-[16/9] flex items-center justify-center">
            <img
              src="/src/assets/images/cardiac_vessel_angiography_1793079943447.jpg"
              alt="Coronary Arterial Tree Anatomy with Left Anterior Descending and Right Coronary Arteries"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Multi-Model Consensus Breakdown */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Model Algorithm</span>
              <span>Predicted Risk</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Logistic Reg:</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {(prediction.consensus.logisticRegression * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Random Forest:</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {(prediction.consensus.randomForest * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">SVM (RBF):</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {(prediction.consensus.svm * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">ACC/AHA ASCVD:</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {(prediction.consensus.ascvdGuideline * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
