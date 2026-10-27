import { ClinicalCaseArchetype, BenchmarkRecord } from '../types/cardio';

export const CLINICAL_ARCHETYPES: ClinicalCaseArchetype[] = [
  {
    id: 'archetype-healthy',
    title: 'Low-Risk Asymptomatic Adult',
    subtitle: '42yo Male · Preserved Aerobic Capacity',
    demographic: '42 years old · Male · Nonsmoker',
    clinicalPresentation: 'Routine executive health checkup. Highly active runner, resting heart rate 54 bpm, normal resting ECG, zero chest discomfort upon maximum treadmill Bruce protocol.',
    trueDiagnosis: 'Normal / Non-CAD',
    parameters: {
      age: 42,
      sex: 1,
      cp: 1, // Typical non-anginal / asymptomatic
      trestbps: 118,
      chol: 178,
      fbs: 0,
      restecg: 0,
      thalach: 182, // High max exercise heart rate
      exang: 0,
      oldpeak: 0.0,
      slope: 1, // Upsloping ST
      ca: 0, // No vessels
      thal: 3, // Normal
      bmi: 22.8,
      smokingStatus: 'never',
      treatedHypertension: false,
    },
  },
  {
    id: 'archetype-intermediate-female',
    title: 'Atypical Female Presentation',
    subtitle: '57yo Female · Mild Hypertension & Dyslipidemia',
    demographic: '57 years old · Female · Post-menopausal',
    clinicalPresentation: 'Reports intermittent retrosternal fullness and dyspnea on brisk incline walking. Resting ECG shows nonspecific ST-T wave flattening. Cholesterol mildly elevated at 242 mg/dL.',
    trueDiagnosis: 'Normal / Non-CAD',
    parameters: {
      age: 57,
      sex: 0,
      cp: 2, // Atypical angina
      trestbps: 138,
      chol: 242,
      fbs: 0,
      restecg: 1, // ST-T wave abnormality
      thalach: 148,
      exang: 0,
      oldpeak: 0.8,
      slope: 2, // Flat
      ca: 0,
      thal: 3,
      bmi: 27.2,
      smokingStatus: 'never',
      treatedHypertension: true,
    },
  },
  {
    id: 'archetype-high-risk-ischemic',
    title: 'High-Risk Exertional Angina',
    subtitle: '63yo Male · ST Depression & Exertional Angina',
    demographic: '63 years old · Male · Former Smoker (20 pack-years)',
    clinicalPresentation: 'Substernal chest pressure radiating to left shoulder provoked during exercise stress test at stage 3 Bruce protocol. 2.4 mm horizontal ST-segment depression in inferolateral leads.',
    trueDiagnosis: 'Coronary Artery Disease',
    parameters: {
      age: 63,
      sex: 1,
      cp: 4, // Asymptomatic / silent ischemia pattern or classic ischemic equiv
      trestbps: 145,
      chol: 268,
      fbs: 1, // Impaired fasting glucose >120
      restecg: 2, // Left ventricular hypertrophy
      thalach: 128, // Blunted max HR
      exang: 1, // Exercise induced angina
      oldpeak: 2.4, // ST depression 2.4mm
      slope: 2, // Flat
      ca: 2, // 2 major vessels calcified/stenosed
      thal: 7, // Reversible perfusion defect
      bmi: 29.4,
      smokingStatus: 'former',
      treatedHypertension: true,
    },
  },
  {
    id: 'archetype-critical-multivessel',
    title: 'Critical Multi-Vessel CAD',
    subtitle: '69yo Male · 3-Vessel Fluoroscopy Disease',
    demographic: '69 years old · Male · Diabetic & Hypertensive',
    clinicalPresentation: 'Progressive exertional angina (CCS Class III) with severe chronotropic incompetence. Fluoroscopy reveals extensive calcification in LAD, LCx, and RCA with 3.6 mm downsloping ST depression.',
    trueDiagnosis: 'Coronary Artery Disease',
    parameters: {
      age: 69,
      sex: 1,
      cp: 4,
      trestbps: 162,
      chol: 294,
      fbs: 1,
      restecg: 2,
      thalach: 112,
      exang: 1,
      oldpeak: 3.6,
      slope: 3, // Downsloping ST
      ca: 3, // 3 major vessels
      thal: 7, // Reversible defect
      bmi: 31.0,
      smokingStatus: 'current',
      treatedHypertension: true,
    },
  },
  {
    id: 'archetype-borderline-metabolic',
    title: 'Borderline Cardiometabolic Profile',
    subtitle: '51yo Male · Pre-hypertensive & Overweight',
    demographic: '51 years old · Male · Sedentary Office Worker',
    clinicalPresentation: 'Mildly elevated systolic blood pressure (134 mmHg), high LDL cholesterol, normal stress test tolerance without angina, but borderline ST flattening.',
    trueDiagnosis: 'Normal / Non-CAD',
    parameters: {
      age: 51,
      sex: 1,
      cp: 3, // Non-anginal pain
      trestbps: 134,
      chol: 228,
      fbs: 0,
      restecg: 0,
      thalach: 156,
      exang: 0,
      oldpeak: 0.6,
      slope: 1,
      ca: 0,
      thal: 3,
      bmi: 28.5,
      smokingStatus: 'never',
      treatedHypertension: false,
    },
  },
];

// Sample of 30 Real Cleveland Clinical Records for benchmark evaluation
export const CLEVELAND_BENCHMARK_SAMPLE: BenchmarkRecord[] = [
  { id: 1, age: 63, sex: 1, cp: 1, trestbps: 145, chol: 233, fbs: 1, restecg: 2, thalach: 150, exang: 0, oldpeak: 2.3, slope: 3, ca: 0, thal: 6, target: 0 },
  { id: 2, age: 67, sex: 1, cp: 4, trestbps: 160, chol: 286, fbs: 0, restecg: 2, thalach: 108, exang: 1, oldpeak: 1.5, slope: 2, ca: 3, thal: 3, target: 1 },
  { id: 3, age: 67, sex: 1, cp: 4, trestbps: 120, chol: 229, fbs: 0, restecg: 2, thalach: 129, exang: 1, oldpeak: 2.6, slope: 2, ca: 2, thal: 7, target: 1 },
  { id: 4, age: 37, sex: 1, cp: 3, trestbps: 130, chol: 250, fbs: 0, restecg: 0, thalach: 187, exang: 0, oldpeak: 3.5, slope: 3, ca: 0, thal: 3, target: 0 },
  { id: 5, age: 41, sex: 0, cp: 2, trestbps: 130, chol: 204, fbs: 0, restecg: 2, thalach: 172, exang: 0, oldpeak: 1.4, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 6, age: 56, sex: 1, cp: 2, trestbps: 120, chol: 236, fbs: 0, restecg: 0, thalach: 178, exang: 0, oldpeak: 0.8, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 7, age: 62, sex: 0, cp: 4, trestbps: 140, chol: 268, fbs: 0, restecg: 2, thalach: 160, exang: 0, oldpeak: 3.6, slope: 3, ca: 2, thal: 3, target: 1 },
  { id: 8, age: 57, sex: 0, cp: 4, trestbps: 120, chol: 354, fbs: 0, restecg: 0, thalach: 163, exang: 1, oldpeak: 0.6, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 9, age: 63, sex: 1, cp: 4, trestbps: 130, chol: 254, fbs: 0, restecg: 2, thalach: 147, exang: 0, oldpeak: 1.4, slope: 2, ca: 1, thal: 7, target: 1 },
  { id: 10, age: 53, sex: 1, cp: 4, trestbps: 140, chol: 203, fbs: 1, restecg: 2, thalach: 155, exang: 1, oldpeak: 3.1, slope: 3, ca: 0, thal: 7, target: 1 },
  { id: 11, age: 57, sex: 1, cp: 4, trestbps: 140, chol: 192, fbs: 0, restecg: 0, thalach: 148, exang: 0, oldpeak: 0.4, slope: 2, ca: 0, thal: 6, target: 0 },
  { id: 12, age: 56, sex: 0, cp: 2, trestbps: 140, chol: 294, fbs: 0, restecg: 2, thalach: 153, exang: 0, oldpeak: 1.3, slope: 2, ca: 0, thal: 3, target: 0 },
  { id: 13, age: 56, sex: 1, cp: 3, trestbps: 130, chol: 256, fbs: 1, restecg: 2, thalach: 142, exang: 1, oldpeak: 0.6, slope: 2, ca: 1, thal: 6, target: 1 },
  { id: 14, age: 44, sex: 1, cp: 2, trestbps: 120, chol: 263, fbs: 0, restecg: 0, thalach: 173, exang: 0, oldpeak: 0.0, slope: 1, ca: 0, thal: 7, target: 0 },
  { id: 15, age: 52, sex: 1, cp: 3, trestbps: 172, chol: 199, fbs: 1, restecg: 0, thalach: 162, exang: 0, oldpeak: 0.5, slope: 1, ca: 0, thal: 7, target: 0 },
  { id: 16, age: 57, sex: 1, cp: 3, trestbps: 150, chol: 168, fbs: 0, restecg: 0, thalach: 174, exang: 0, oldpeak: 1.6, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 17, age: 48, sex: 1, cp: 2, trestbps: 110, chol: 229, fbs: 0, restecg: 0, thalach: 168, exang: 0, oldpeak: 1.0, slope: 3, ca: 0, thal: 7, target: 1 },
  { id: 18, age: 54, sex: 1, cp: 4, trestbps: 140, chol: 239, fbs: 0, restecg: 0, thalach: 160, exang: 0, oldpeak: 1.2, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 19, age: 48, sex: 0, cp: 3, trestbps: 130, chol: 275, fbs: 0, restecg: 0, thalach: 139, exang: 0, oldpeak: 0.2, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 20, age: 49, sex: 1, cp: 2, trestbps: 130, chol: 266, fbs: 0, restecg: 0, thalach: 171, exang: 0, oldpeak: 0.6, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 21, age: 64, sex: 1, cp: 1, trestbps: 110, chol: 211, fbs: 0, restecg: 2, thalach: 144, exang: 1, oldpeak: 1.8, slope: 2, ca: 0, thal: 3, target: 0 },
  { id: 22, age: 58, sex: 0, cp: 1, trestbps: 150, chol: 283, fbs: 1, restecg: 2, thalach: 162, exang: 0, oldpeak: 1.0, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 23, age: 58, sex: 1, cp: 2, trestbps: 120, chol: 284, fbs: 0, restecg: 2, thalach: 160, exang: 0, oldpeak: 1.8, slope: 2, ca: 0, thal: 3, target: 1 },
  { id: 24, age: 58, sex: 1, cp: 3, trestbps: 132, chol: 224, fbs: 0, restecg: 2, thalach: 173, exang: 0, oldpeak: 3.2, slope: 1, ca: 2, thal: 7, target: 1 },
  { id: 25, age: 60, sex: 1, cp: 4, trestbps: 130, chol: 206, fbs: 0, restecg: 2, thalach: 132, exang: 1, oldpeak: 2.4, slope: 2, ca: 2, thal: 7, target: 1 },
  { id: 26, age: 50, sex: 0, cp: 3, trestbps: 120, chol: 219, fbs: 0, restecg: 0, thalach: 158, exang: 0, oldpeak: 1.6, slope: 2, ca: 0, thal: 3, target: 0 },
  { id: 27, age: 58, sex: 0, cp: 3, trestbps: 120, chol: 340, fbs: 0, restecg: 0, thalach: 172, exang: 0, oldpeak: 0.0, slope: 1, ca: 0, thal: 3, target: 0 },
  { id: 28, age: 66, sex: 0, cp: 1, trestbps: 150, chol: 226, fbs: 0, restecg: 0, thalach: 114, exang: 0, oldpeak: 2.6, slope: 3, ca: 0, thal: 3, target: 0 },
  { id: 29, age: 43, sex: 1, cp: 4, trestbps: 120, chol: 177, fbs: 0, restecg: 2, thalach: 120, exang: 1, oldpeak: 2.5, slope: 2, ca: 0, thal: 7, target: 1 },
  { id: 30, age: 57, sex: 1, cp: 4, trestbps: 150, chol: 276, fbs: 0, restecg: 2, thalach: 112, exang: 1, oldpeak: 0.6, slope: 2, ca: 1, thal: 6, target: 1 },
];

// Pre-computed ROC curve points across threshold grid [0.05 ... 0.95]
export const ROC_CURVE_POINTS = [
  { threshold: 0.05, fpr: 0.78, tpr: 0.99 },
  { threshold: 0.10, fpr: 0.52, tpr: 0.97 },
  { threshold: 0.15, fpr: 0.38, tpr: 0.96 },
  { threshold: 0.20, fpr: 0.29, tpr: 0.95 },
  { threshold: 0.30, fpr: 0.21, tpr: 0.93 },
  { threshold: 0.40, fpr: 0.16, tpr: 0.91 },
  { threshold: 0.50, fpr: 0.12, tpr: 0.89 }, // Default operating point
  { threshold: 0.60, fpr: 0.09, tpr: 0.84 },
  { threshold: 0.70, fpr: 0.06, tpr: 0.76 },
  { threshold: 0.80, fpr: 0.03, tpr: 0.64 },
  { threshold: 0.90, fpr: 0.01, tpr: 0.42 },
];

export const MODEL_EVALUATION_METRICS = {
  auc: 0.908,
  accuracy: 0.878,
  sensitivity: 0.892,
  specificity: 0.866,
  precision: 0.849,
  npv: 0.904,
  f1: 0.870,
  cohortSize: 303,
  positiveCases: 139,
  negativeCases: 164,
  truePositives: 124,
  falsePositives: 22,
  trueNegatives: 142,
  falseNegatives: 15,
};
