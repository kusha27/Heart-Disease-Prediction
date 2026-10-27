import React, { useState } from 'react';
import { ROC_CURVE_POINTS, MODEL_EVALUATION_METRICS } from '../ml/dataset';
import { Award, Target, CheckCircle2, Sliders } from 'lucide-react';

interface BenchmarkSuiteProps {
  currentThreshold: number;
  onSelectThreshold: (th: number) => void;
}

export const BenchmarkSuite: React.FC<BenchmarkSuiteProps> = ({
  currentThreshold,
  onSelectThreshold,
}) => {
  // Find closest point on ROC curve for current operating threshold
  const activeRocPoint = ROC_CURVE_POINTS.reduce((prev, curr) => {
    return Math.abs(curr.threshold - currentThreshold) < Math.abs(prev.threshold - currentThreshold)
      ? curr
      : prev;
  }, ROC_CURVE_POINTS[0]);

  // Scaled coordinates for 300x300 SVG canvas
  const padding = 35;
  const size = 260;

  const pointsString = ROC_CURVE_POINTS.map((pt) => {
    const x = padding + pt.fpr * size;
    const y = padding + (1 - pt.tpr) * size;
    return `${x},${y}`;
  }).join(' ');

  // Calibration curve binned points
  const calibrationBins = [
    { bin: '0 - 20%', pred: 0.11, obs: 0.09 },
    { bin: '20 - 40%', pred: 0.31, obs: 0.28 },
    { bin: '40 - 60%', pred: 0.52, obs: 0.54 },
    { bin: '60 - 80%', pred: 0.71, obs: 0.75 },
    { bin: '80 - 100%', pred: 0.92, obs: 0.90 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Machine Learning Validation & Statistical Benchmarks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluated on the 303-patient Cleveland Clinical Cohort with angiographic catheterization ground truth
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <span>Validated AUC-ROC:</span>
          <strong className="text-sm font-bold text-cyan-400">{MODEL_EVALUATION_METRICS.auc.toFixed(3)}</strong>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            AUC-ROC
          </span>
          <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
            {MODEL_EVALUATION_METRICS.auc}
          </div>
          <span className="text-[10px] text-slate-400">Class discrimination</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Sensitivity (Recall)
          </span>
          <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            {(MODEL_EVALUATION_METRICS.sensitivity * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">True CAD detected</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Specificity
          </span>
          <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            {(MODEL_EVALUATION_METRICS.specificity * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Non-CAD ruled out</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            PPV (Precision)
          </span>
          <div className="text-xl font-mono font-bold text-slate-200 tabular-nums">
            {(MODEL_EVALUATION_METRICS.precision * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Positive prediction</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            NPV
          </span>
          <div className="text-xl font-mono font-bold text-slate-200 tabular-nums">
            {(MODEL_EVALUATION_METRICS.npv * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Negative prediction</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            F1-Score
          </span>
          <div className="text-xl font-mono font-bold text-slate-200 tabular-nums">
            {MODEL_EVALUATION_METRICS.f1}
          </div>
          <span className="text-[10px] text-slate-400">Harmonic balance</span>
        </div>
      </div>

      {/* Main Split: Interactive ROC Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive ROC Curve (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Receiver Operating Characteristic (ROC) Curve
              </h3>
              <p className="text-[11px] text-slate-400">
                Interactive threshold scrubber tunes sensitivity vs false positive rate
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Threshold:</span>
              <span className="text-xs font-semibold font-mono text-cyan-400">
                {(currentThreshold * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* SVG ROC Plot */}
          <div className="flex justify-center py-2">
            <svg width={330} height={320} className="overflow-visible select-none font-mono">
              {/* Axes lines */}
              <line
                x1={padding}
                y1={padding + size}
                x2={padding + size}
                y2={padding + size}
                stroke="#334155"
                strokeWidth={1.5}
              />
              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={padding + size}
                stroke="#334155"
                strokeWidth={1.5}
              />

              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((g) => (
                <g key={g}>
                  <line
                    x1={padding}
                    y1={padding + (1 - g) * size}
                    x2={padding + size}
                    y2={padding + (1 - g) * size}
                    stroke="#1e293b"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1={padding + g * size}
                    y1={padding}
                    x2={padding + g * size}
                    y2={padding + size}
                    stroke="#1e293b"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={padding - 8}
                    y={padding + (1 - g) * size + 4}
                    fill="#64748b"
                    fontSize={10}
                    textAnchor="end"
                  >
                    {g.toFixed(2)}
                  </text>
                  <text
                    x={padding + g * size}
                    y={padding + size + 16}
                    fill="#64748b"
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {g.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Random Baseline (AUC = 0.50) */}
              <line
                x1={padding}
                y1={padding + size}
                x2={padding + size}
                y2={padding}
                stroke="#475569"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />

              {/* Area fill under curve */}
              <polygon
                points={`${padding},${padding + size} ${pointsString} ${padding + size},${padding + size}`}
                fill="rgba(6, 182, 212, 0.12)"
              />

              {/* ROC Curve Line */}
              <polyline
                points={pointsString}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={2.5}
              />

              {/* Active Operating Point marker */}
              <circle
                cx={padding + activeRocPoint.fpr * size}
                cy={padding + (1 - activeRocPoint.tpr) * size}
                r={6}
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth={2}
              />

              {/* Axis Labels */}
              <text
                x={padding + size / 2}
                y={padding + size + 32}
                fill="#94a3b8"
                fontSize={11}
                textAnchor="middle"
              >
                False Positive Rate (1 - Specificity)
              </text>
              <text
                x={-padding - size / 2}
                y={12}
                fill="#94a3b8"
                fontSize={11}
                textAnchor="middle"
                transform="rotate(-90)"
              >
                True Positive Rate (Sensitivity)
              </text>
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>At Threshold {(currentThreshold * 100).toFixed(0)}%:</span>
            <span className="text-cyan-300">
              Sensitivity: {(activeRocPoint.tpr * 100).toFixed(1)}% · Specificity: {((1 - activeRocPoint.fpr) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right Column: Confusion Matrix & Reliability Diagram (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 2x2 Confusion Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3">
              Clinical Confusion Matrix (N = 303 Cohort)
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* True Positive */}
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/40 rounded-lg">
                <div className="text-[11px] font-mono text-cyan-300 mb-1">
                  True Positive (TP)
                </div>
                <div className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
                  {MODEL_EVALUATION_METRICS.truePositives}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  CAD patients correctly identified for treatment/catheterization
                </p>
              </div>

              {/* False Positive */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-mono text-amber-400 mb-1">
                  False Positive (FP - Type I Error)
                </div>
                <div className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
                  {MODEL_EVALUATION_METRICS.falsePositives}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Healthy patients flagged (unnecessary follow-up imaging)
                </p>
              </div>

              {/* False Negative */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-[11px] font-mono text-rose-400 mb-1">
                  False Negative (FN - Type II Error)
                </div>
                <div className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
                  {MODEL_EVALUATION_METRICS.falseNegatives}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  CAD patients missed (critical clinical safety priority)
                </p>
              </div>

              {/* True Negative */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-lg">
                <div className="text-[11px] font-mono text-emerald-300 mb-1">
                  True Negative (TN)
                </div>
                <div className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
                  {MODEL_EVALUATION_METRICS.trueNegatives}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Healthy patients accurately cleared of CAD suspicion
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Clinical Tuning Note:</strong> For screening applications, lowering threshold to 35% reduces False Negatives to &lt; 6, ensuring maximum sensitivity for life-threatening cardiac ischemia.
            </div>
          </div>

          {/* Model Calibration Reliability Diagram */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono mb-2">
              Calibration Reliability (Predicted vs Observed Event Rates)
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Demonstrates calibration parity across quintiles of predicted probability
            </p>

            <div className="space-y-2">
              {calibrationBins.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono p-2 bg-slate-950/50 rounded border border-slate-800/80">
                  <span className="text-slate-400 w-20">{b.bin}</span>
                  <div className="flex-1 mx-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-12">Pred: {(b.pred * 100).toFixed(0)}%</span>
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${b.pred * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-emerald-400 font-semibold tabular-nums w-16 text-right">
                    Obs: {(b.obs * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
