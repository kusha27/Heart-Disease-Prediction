import React, { useState } from 'react';
import { PatientParameters, PredictionResult } from '../types/cardio';
import { Printer, Copy, Check, X, ShieldAlert, Heart, FileCheck } from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientParameters;
  prediction: PredictionResult;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  prediction,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const reportText = `
CARDIOMAP CLINICAL EVALUATION NOTE
==================================================
Date of Evaluation: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Patient ID: #CAD-${Math.abs(patient.age * 137 + patient.chol).toString().slice(0, 6)}
Demographics: ${patient.age} years old · Biological ${patient.sex === 1 ? 'Male' : 'Female'}

1. HEMODYNAMIC & BIOMARKER PROFILE:
- Resting Blood Pressure: ${patient.trestbps} mm Hg
- Total Serum Cholesterol: ${patient.chol} mg/dL
- Fasting Blood Sugar: ${patient.fbs === 1 ? '> 120 mg/dL (Elevated)' : '≤ 120 mg/dL (Normal)'}
- Resting ECG: ${patient.restecg === 0 ? 'Normal' : patient.restecg === 1 ? 'ST-T Wave Abnormality' : 'Left Ventricular Hypertrophy'}

2. EXERCISE STRESS ELECTROCARDIOGRAPHY:
- Max Achieved Exercise Heart Rate: ${patient.thalach} bpm
- Exercise-Induced Angina: ${patient.exang === 1 ? 'Present (Provoked by stress)' : 'Absent'}
- ST-Segment Depression (Oldpeak): ${patient.oldpeak.toFixed(1)} mm
- ST-Segment Slope: ${patient.slope === 1 ? 'Upsloping' : patient.slope === 2 ? 'Flat' : 'Downsloping'}

3. ANGIOGRAPHY & NUCLEAR PERFUSION:
- Fluoroscopy Major Vessel Calcification: ${patient.ca} of 3 vessels
- Thallium Perfusion Scintigraphy: ${patient.thal === 3 ? 'Normal Perfusion' : patient.thal === 6 ? 'Fixed Defect (Prior Scar)' : 'Reversible Defect (Viable Ischemia)'}

4. MACHINE LEARNING STRATIFICATION:
- Multi-Model Consensus Probability: ${(prediction.probability * 100).toFixed(1)}%
- Stratification Tier: ${prediction.riskTier.toUpperCase()}
- 95% Confidence Interval: [${(prediction.confidenceInterval[0] * 100).toFixed(1)}% - ${(prediction.confidenceInterval[1] * 100).toFixed(1)}%]
- Model Breakdown:
  * Logistic Regression: ${(prediction.consensus.logisticRegression * 100).toFixed(1)}%
  * Random Forest Classifier: ${(prediction.consensus.randomForest * 100).toFixed(1)}%
  * Support Vector Machine (RBF): ${(prediction.consensus.svm * 100).toFixed(1)}%
  * ACC/AHA ASCVD Risk Score: ${(prediction.consensus.ascvdGuideline * 100).toFixed(1)}%

5. PRIMARY RISK DRIVERS:
${prediction.primaryRiskDrivers.map(d => `* ${d.featureName}: ${d.patientValue} (${d.clinicalSummary})`).join('\n')}

6. CLINICAL RECOMMENDATIONS (ACC/AHA GUIDELINE CONSENSUS):
${prediction.probability >= 0.50 ? `
- DIAGNOSTIC: Urgent referral for non-invasive Coronary Computed Tomography Angiography (CCTA) or direct invasive coronary angiography based on symptom severity.
- PHARMACOTHERAPY: Initiate high-intensity statin therapy (Atorvastatin 40-80 mg or Rosuvastatin 20-40 mg). Prescribe low-dose aspirin (81 mg daily) unless contraindicated. Optimize antihypertensive regimen to achieve SBP < 120 mmHg.
- INTERVENTION: Assess for exertional ischemia; evaluate candidate vessels for percutaneous coronary intervention (PCI) or CABG if multi-vessel disease confirmed.
` : `
- PRIMARY PREVENTION: Maintain aggressive cardiovascular lifestyle modification. Aerobic physical activity target of ≥150 minutes/week.
- MONITORING: Re-evaluate lipid panel and resting blood pressure in 6-12 months. Repeat cardiovascular risk assessment annually.
`}
==================================================
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Cardiology Clinical Consultation Note
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-900 bg-cyan-400 hover:bg-cyan-300 font-semibold rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs font-sans print:text-black print:bg-white print:p-0">
          {/* Header Block */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold text-slate-100 print:text-black">
                  CardioML Diagnostic Summary & Risk Stratification
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                  Algorithmic Clinical Decision Support Report · ACC/AHA Multi-Factorial Protocol
                </p>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400 print:text-gray-600">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Status: Verified by Consensus Model</div>
              </div>
            </div>
          </div>

          {/* Patient Overview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-lg print:border-gray-300 print:bg-gray-50">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-600">Patient</span>
              <div className="font-semibold text-slate-200 print:text-black">
                {patient.age}y {patient.sex === 1 ? 'Male' : 'Female'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-600">Blood Pressure</span>
              <div className="font-mono text-slate-200 print:text-black font-semibold">
                {patient.trestbps} mm Hg
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-600">Cholesterol</span>
              <div className="font-mono text-slate-200 print:text-black font-semibold">
                {patient.chol} mg/dL
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 print:text-gray-600">Max Stress HR</span>
              <div className="font-mono text-slate-200 print:text-black font-semibold">
                {patient.thalach} bpm
              </div>
            </div>
          </div>

          {/* Risk Classification Banner */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 flex items-start gap-4 print:border-gray-400 print:bg-gray-100">
            <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 print:text-blue-700">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 print:text-black font-mono">
                  Machine Learning Risk Classification: {prediction.riskTier.toUpperCase()}
                </span>
                <span className="text-base font-bold font-mono text-cyan-400 print:text-blue-700">
                  {(prediction.probability * 100).toFixed(1)}% Probability
                </span>
              </div>
              <p className="text-slate-300 print:text-gray-700 text-xs leading-relaxed">
                Consensus classification derived from L2-calibrated logistic regression, random forest ensembles, and SVM on Cleveland cardiovascular cohort. 95% Confidence Interval: [{(prediction.confidenceInterval[0] * 100).toFixed(1)}% – {(prediction.confidenceInterval[1] * 100).toFixed(1)}%].
              </p>
            </div>
          </div>

          {/* Key Findings & Physiological Parameters */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono print:text-black border-b border-slate-800 pb-1">
              Key Diagnostic Biomarkers & Clinical Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-950/40 rounded border border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">Chest Pain Type:</span>
                <span className="font-medium text-slate-200 print:text-black">
                  Type {patient.cp} ({patient.cp === 4 ? 'Asymptomatic Ischemic' : patient.cp === 1 ? 'Typical' : 'Atypical'})
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/40 rounded border border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">Exercise Angina:</span>
                <span className="font-medium text-slate-200 print:text-black">
                  {patient.exang === 1 ? 'Provoked (Positive)' : 'Absent (Negative)'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/40 rounded border border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">ST-Segment Depression:</span>
                <span className="font-mono font-medium text-slate-200 print:text-black">
                  {patient.oldpeak.toFixed(1)} mm ({patient.slope === 1 ? 'Upsloping' : patient.slope === 2 ? 'Flat' : 'Downsloping'})
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/40 rounded border border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">Fluoroscopy Vessels:</span>
                <span className="font-mono font-medium text-slate-200 print:text-black">
                  {patient.ca} major vessel(s) occluded
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/40 rounded border border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">Thallium Scintigraphy:</span>
                <span className="font-medium text-slate-200 print:text-black">
                  {patient.thal === 3 ? 'Normal Perfusion' : patient.thal === 6 ? 'Fixed Defect' : 'Reversible Defect'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/40 rounded border border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">Fasting Blood Sugar:</span>
                <span className="font-medium text-slate-200 print:text-black">
                  {patient.fbs === 1 ? '> 120 mg/dL' : '≤ 120 mg/dL'}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Action Plan */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono print:text-black border-b border-slate-800 pb-1">
              ACC/AHA Guideline-Directed Action Plan
            </h3>
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2 print:border-gray-300">
              {prediction.probability >= 0.50 ? (
                <>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                    <strong>1. Diagnostic Workup:</strong> High pre-test probability of obstructive CAD warrants expedited anatomical evaluation via Coronary Computed Tomography Angiography (CCTA) or direct invasive coronary catheterization.
                  </p>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                    <strong>2. Medical Therapy:</strong> Initiate high-intensity statin therapy (Atorvastatin 40–80 mg daily) to achieve LDL-C reduction ≥50%. Add low-dose aspirin 81 mg once daily.
                  </p>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                    <strong>3. Hemodynamic Targets:</strong> Tight blood pressure control targeting SBP &lt; 120 mmHg and DBP &lt; 80 mmHg with ACE-inhibitor or ARB.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                    <strong>1. Clinical Surveillance:</strong> Low pre-test probability of flow-limiting stenosis. Non-invasive functional imaging or invasive angiogram is not routinely indicated at this time.
                  </p>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                    <strong>2. Primary Prevention:</strong> Optimize cardiovascular health through structured aerobic physical exercise (minimum 150 minutes of moderate-intensity exercise weekly).
                  </p>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                    <strong>3. Reassessment:</strong> Annual re-stratification of cardiovascular risk and lipid profile monitoring.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
