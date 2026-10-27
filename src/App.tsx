/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ArchetypeSelector } from './components/ArchetypeSelector';
import { PredictionHero } from './components/PredictionHero';
import { PatientForm } from './components/PatientForm';
import { ExplainabilityView } from './components/ExplainabilityView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { BenchmarkSuite } from './components/BenchmarkSuite';
import { CohortExplorer } from './components/CohortExplorer';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { PatientParameters, ClinicalCaseArchetype } from './types/cardio';
import { CLINICAL_ARCHETYPES } from './ml/dataset';
import { evaluateHeartDisease } from './ml/models';

export default function App() {
  // Initial patient state starts with the High-Risk Exertional Angina archetype
  const initialArchetype = CLINICAL_ARCHETYPES[2];
  const [patient, setPatient] = useState<PatientParameters>(initialArchetype.parameters);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(initialArchetype.id);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'explainability' | 'whatif' | 'benchmarks' | 'cohort'>('diagnostic');

  // Active model and decision threshold
  const [selectedModel, setSelectedModel] = useState<'ensemble' | 'logistic' | 'randomForest' | 'svm' | 'ascvd'>('ensemble');
  const [threshold, setThreshold] = useState<number>(0.50);

  // Modal state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Evaluate patient through ML engine
  const prediction = useMemo(() => {
    return evaluateHeartDisease(patient, {
      activeModel: selectedModel,
      threshold,
    });
  }, [patient, selectedModel, threshold]);

  // Handle archetype selection
  const handleSelectArchetype = (archetype: ClinicalCaseArchetype) => {
    setPatient({ ...archetype.parameters });
    setSelectedArchetypeId(archetype.id);
  };

  // Handle patient form changes
  const handlePatientChange = (updated: PatientParameters) => {
    setPatient(updated);
    setSelectedArchetypeId(null); // Custom profile once modified
  };

  // Reset to default baseline
  const handleResetDefaults = () => {
    setPatient({ ...initialArchetype.parameters });
    setSelectedArchetypeId(initialArchetype.id);
    setThreshold(0.50);
  };

  // Handle loading patient from cohort table into lab
  const handleLoadCohortPatient = (cohortPatient: PatientParameters) => {
    setPatient({ ...cohortPatient });
    setSelectedArchetypeId(null);
    setActiveTab('diagnostic');
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        riskTier={prediction.riskTier}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Preset Archetype Bar */}
        <ArchetypeSelector
          selectedId={selectedArchetypeId}
          onSelectArchetype={handleSelectArchetype}
        />

        {/* Prediction Hero (Always visible in diagnostic & explainability & whatif) */}
        <PredictionHero
          prediction={prediction}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />

        {/* Workspace Views */}
        {activeTab === 'diagnostic' && (
          <div className="space-y-6">
            <PatientForm
              patient={patient}
              onChange={handlePatientChange}
              onReset={handleResetDefaults}
            />
          </div>
        )}

        {activeTab === 'explainability' && (
          <ExplainabilityView prediction={prediction} />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator
            baselinePatient={patient}
            baselinePrediction={prediction}
          />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkSuite
            currentThreshold={threshold}
            onSelectThreshold={setThreshold}
          />
        )}

        {activeTab === 'cohort' && (
          <CohortExplorer
            onLoadPatient={handleLoadCohortPatient}
            activeThreshold={threshold}
          />
        )}
      </main>

      {/* Clinical Evaluation Report Modal */}
      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        patient={patient}
        prediction={prediction}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05070d] py-6 px-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span>CardioML Diagnostic Engine</span>
            <span>·</span>
            <span>Calibrated on Cleveland CAD Benchmark (N=303)</span>
          </div>
          <div>
            <span>ACC/AHA Class of Recommendation Clinical Decision Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
