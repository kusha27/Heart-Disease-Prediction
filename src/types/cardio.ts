export type BiologicalSex = 0 | 1; // 0: Female, 1: Male
export type ChestPainType = 1 | 2 | 3 | 4; // 1: Typical angina, 2: Atypical angina, 3: Non-anginal, 4: Asymptomatic
export type FastingBloodSugar = 0 | 1; // 0: <= 120 mg/dl, 1: > 120 mg/dl
export type RestingECG = 0 | 1 | 2; // 0: Normal, 1: ST-T wave abnormality, 2: Left ventricular hypertrophy
export type ExerciseAngina = 0 | 1; // 0: No, 1: Yes
export type STSlope = 1 | 2 | 3; // 1: Upsloping, 2: Flat, 3: Downsloping
export type MajorVessels = 0 | 1 | 2 | 3; // Number of major vessels (0-3) colored by fluoroscopy
export type Thalassemia = 3 | 6 | 7; // 3: Normal, 6: Fixed defect, 7: Reversible defect

export interface PatientParameters {
  age: number; // 29 - 77 years
  sex: BiologicalSex;
  cp: ChestPainType;
  trestbps: number; // Resting BP (mm Hg), 94 - 200
  chol: number; // Serum cholesterol (mg/dL), 126 - 564
  fbs: FastingBloodSugar;
  restecg: RestingECG;
  thalach: number; // Maximum heart rate achieved (bpm), 71 - 202
  exang: ExerciseAngina;
  oldpeak: number; // ST depression induced by exercise (mm), 0.0 - 6.2
  slope: STSlope;
  ca: MajorVessels;
  thal: Thalassemia;
  
  // Optional clinical modifiers
  bmi?: number;
  smokingStatus?: 'never' | 'former' | 'current';
  hdl?: number;
  treatedHypertension?: boolean;
}

export type RiskTier = 'low' | 'moderate' | 'high' | 'critical';

export interface FeatureImpact {
  featureKey: keyof PatientParameters;
  featureName: string;
  patientValue: string | number;
  normalRange: string;
  shapValue: number; // Log-odds or probability contribution delta
  direction: 'risk_increasing' | 'protective';
  clinicalSummary: string;
}

export interface PredictionConsensus {
  logisticRegression: number;
  randomForest: number;
  svm: number;
  ascvdGuideline: number;
  ensembleWeighted: number;
}

export interface PredictionResult {
  probability: number; // 0.0 - 1.0
  riskTier: RiskTier;
  binaryClassification: 0 | 1; // 0: Low probability (< threshold), 1: CAD Indicated (>= threshold)
  confidenceInterval: [number, number]; // [low, high]
  logOdds: number;
  oddsRatio: number;
  primaryRiskDrivers: FeatureImpact[];
  protectiveFactors: FeatureImpact[];
  consensus: PredictionConsensus;
  activeModelName: string;
  thresholdApplied: number;
}

export interface ClinicalCaseArchetype {
  id: string;
  title: string;
  subtitle: string;
  demographic: string;
  clinicalPresentation: string;
  trueDiagnosis: 'Normal / Non-CAD' | 'Coronary Artery Disease';
  parameters: PatientParameters;
}

export interface BenchmarkRecord {
  id: number;
  age: number;
  sex: BiologicalSex;
  cp: ChestPainType;
  trestbps: number;
  chol: number;
  fbs: FastingBloodSugar;
  restecg: RestingECG;
  thalach: number;
  exang: ExerciseAngina;
  oldpeak: number;
  slope: STSlope;
  ca: MajorVessels;
  thal: Thalassemia;
  target: 0 | 1; // 0: <50% diameter narrowing, 1: >50% diameter narrowing (CAD)
}
