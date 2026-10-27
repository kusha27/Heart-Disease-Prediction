import React from 'react';
import {
  PatientParameters,
  BiologicalSex,
  ChestPainType,
  FastingBloodSugar,
  RestingECG,
  ExerciseAngina,
  STSlope,
  MajorVessels,
  Thalassemia,
} from '../types/cardio';
import { Heart, Activity, Waves, Stethoscope, RotateCcw } from 'lucide-react';

interface PatientFormProps {
  patient: PatientParameters;
  onChange: (updated: PatientParameters) => void;
  onReset: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onChange,
  onReset,
}) => {
  const updateField = <K extends keyof PatientParameters>(
    key: K,
    val: PatientParameters[K]
  ) => {
    onChange({
      ...patient,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-cyan-400" />
            Patient Clinical Data & Diagnostic Biomarkers
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            13 standardized clinical features calibrated to the UCI Cleveland Heart Disease Cohort
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md transition-colors font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: Patient Profile & Hemodynamics */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Heart className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Demographics & Hemodynamics
            </h3>
          </div>

          {/* Age */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="patient-age" className="font-medium text-slate-300">Age</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Normal 30-55</span>
                <span className="font-mono text-xs font-semibold text-cyan-300 tabular-nums">
                  {patient.age} yrs
                </span>
              </div>
            </div>
            <input
              id="patient-age"
              type="range"
              min={25}
              max={80}
              value={patient.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Biological Sex */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('sex', 1 as BiologicalSex)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  patient.sex === 1
                    ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Male (1)
              </button>
              <button
                type="button"
                onClick={() => updateField('sex', 0 as BiologicalSex)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  patient.sex === 0
                    ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Female (0)
              </button>
            </div>
          </div>

          {/* Resting Blood Pressure */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="patient-trestbps" className="font-medium text-slate-300">Resting Blood Pressure</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">&lt; 120 mmHg</span>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${
                    patient.trestbps >= 140 ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  {patient.trestbps} mm Hg
                </span>
              </div>
            </div>
            <input
              id="patient-trestbps"
              type="range"
              min={90}
              max={200}
              step={2}
              value={patient.trestbps}
              onChange={(e) => updateField('trestbps', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Serum Cholesterol */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="patient-chol" className="font-medium text-slate-300">Serum Cholesterol</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">&lt; 200 mg/dL</span>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${
                    patient.chol >= 240 ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  {patient.chol} mg/dL
                </span>
              </div>
            </div>
            <input
              id="patient-chol"
              type="range"
              min={120}
              max={450}
              step={5}
              value={patient.chol}
              onChange={(e) => updateField('chol', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Fasting Blood Sugar */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Fasting Blood Sugar (&gt; 120 mg/dL)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('fbs', 0 as FastingBloodSugar)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  patient.fbs === 0
                    ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                ≤ 120 mg/dL (Normal)
              </button>
              <button
                type="button"
                onClick={() => updateField('fbs', 1 as FastingBloodSugar)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  patient.fbs === 1
                    ? 'bg-amber-950/60 border-amber-500/70 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                &gt; 120 mg/dL (Elevated)
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: Stress Testing & Electrocardiography */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Stress Electrocardiography (Treadmill)
            </h3>
          </div>

          {/* Max Achieved Heart Rate (Thalach) */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="patient-thalach" className="font-medium text-slate-300">Max Exercise Heart Rate</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Target 140-190</span>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${
                    patient.thalach < 130 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {patient.thalach} bpm
                </span>
              </div>
            </div>
            <input
              id="patient-thalach"
              type="range"
              min={70}
              max={210}
              value={patient.thalach}
              onChange={(e) => updateField('thalach', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Higher peak chronotropic response reflects preserved cardiac reserve
            </p>
          </div>

          {/* Exercise Induced Angina (exang) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Exercise-Induced Angina
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField('exang', 0 as ExerciseAngina)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  patient.exang === 0
                    ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                No Angina (0)
              </button>
              <button
                type="button"
                onClick={() => updateField('exang', 1 as ExerciseAngina)}
                className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                  patient.exang === 1
                    ? 'bg-rose-950/60 border-rose-500/70 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Angina Induced (1)
              </button>
            </div>
          </div>

          {/* ST Segment Depression (Oldpeak) */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label htmlFor="patient-oldpeak" className="font-medium text-slate-300">ST Depression (Oldpeak)</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">&lt; 1.0 mm</span>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${
                    patient.oldpeak >= 1.5 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {patient.oldpeak.toFixed(1)} mm
                </span>
              </div>
            </div>
            <input
              id="patient-oldpeak"
              type="range"
              min={0.0}
              max={6.0}
              step={0.1}
              value={patient.oldpeak}
              onChange={(e) => updateField('oldpeak', Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ST depression relative to rest indicates subendocardial ischemia
            </p>
          </div>

          {/* Peak Exercise ST Slope */}
          <div>
            <label htmlFor="patient-slope" className="block text-xs font-medium text-slate-300 mb-1.5">
              Peak ST Segment Slope
            </label>
            <select
              id="patient-slope"
              value={patient.slope}
              onChange={(e) => updateField('slope', Number(e.target.value) as STSlope)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>Upsloping (Physiological / Favorable)</option>
              <option value={2}>Flat (Equivocal / Borderline Ischemic)</option>
              <option value={3}>Downsloping (High Ischemia Specificity)</option>
            </select>
          </div>

          {/* Resting Electrocardiogram */}
          <div>
            <label htmlFor="patient-restecg" className="block text-xs font-medium text-slate-300 mb-1.5">
              Resting ECG
            </label>
            <select
              id="patient-restecg"
              value={patient.restecg}
              onChange={(e) => updateField('restecg', Number(e.target.value) as RestingECG)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value={0}>0: Normal Resting Rhythms</option>
              <option value={1}>1: ST-T Wave Abnormality (T-inversion/elevation &gt; 0.05 mV)</option>
              <option value={2}>2: Left Ventricular Hypertrophy (Estes Criteria)</option>
            </select>
          </div>
        </div>

        {/* Module 3: Fluoroscopy & Nuclear Scintigraphy */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Angiography & Myocardial Perfusion
            </h3>
          </div>

          {/* Chest Pain Type */}
          <div>
            <label htmlFor="patient-cp" className="block text-xs font-medium text-slate-300 mb-1.5">
              Chest Pain Presentation (Angina Pattern)
            </label>
            <select
              id="patient-cp"
              value={patient.cp}
              onChange={(e) => updateField('cp', Number(e.target.value) as ChestPainType)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>Type 1: Typical Angina</option>
              <option value={2}>Type 2: Atypical Angina</option>
              <option value={3}>Type 3: Non-Anginal Pain</option>
              <option value={4}>Type 4: Asymptomatic Ischemia (CAD Indicator)</option>
            </select>
          </div>

          {/* Number of Major Vessels Colored by Fluoroscopy (ca) */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label className="font-medium text-slate-300">
                Major Vessels with Occlusion (Fluoroscopy)
              </label>
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  patient.ca > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {patient.ca} / 3 vessels
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {([0, 1, 2, 3] as MajorVessels[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateField('ca', v)}
                  className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                    patient.ca === v
                      ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Counts major epicardial coronary arteries (LAD, LCx, RCA) with significant calcification
            </p>
          </div>

          {/* Thallium Stress Scintigraphy (thal) */}
          <div>
            <label htmlFor="patient-thal" className="block text-xs font-medium text-slate-300 mb-1.5">
              Thallium Scintigraphy (Myocardial Perfusion)
            </label>
            <select
              id="patient-thal"
              value={patient.thal}
              onChange={(e) => updateField('thal', Number(e.target.value) as Thalassemia)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value={3}>3: Normal Perfusion (Uniform Tracer Uptake)</option>
              <option value={6}>6: Fixed Defect (Previous Infarct Scar)</option>
              <option value={7}>7: Reversible Defect (Viable Ischemic Myocardium)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Reversible defects indicate exercise-induced myocardial hypoperfusion
            </p>
          </div>

          {/* Secondary Clinical Factors */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Secondary Risk Modifiers (ACC/AHA)
            </span>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Smoking History</span>
              <select
                aria-label="Smoking History"
                value={patient.smokingStatus || 'never'}
                onChange={(e) => updateField('smokingStatus', e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Antihypertensive Rx</span>
              <button
                type="button"
                onClick={() => updateField('treatedHypertension', !patient.treatedHypertension)}
                className={`px-2 py-0.5 rounded text-xs border ${
                  patient.treatedHypertension
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {patient.treatedHypertension ? 'Treated' : 'Untreated'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
