import React, { useState, useMemo } from 'react';
import { BenchmarkRecord, PatientParameters } from '../types/cardio';
import { CLEVELAND_BENCHMARK_SAMPLE } from '../ml/dataset';
import { evaluateHeartDisease } from '../ml/models';
import { Users, Search, Download, ArrowUpRight, Check, X, Filter } from 'lucide-react';

interface CohortExplorerProps {
  onLoadPatient: (patient: PatientParameters) => void;
  activeThreshold: number;
}

export const CohortExplorer: React.FC<CohortExplorerProps> = ({
  onLoadPatient,
  activeThreshold,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'cad' | 'normal' | 'discrepancy'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Evaluate all benchmark records through current model
  const evaluatedRecords = useMemo(() => {
    return CLEVELAND_BENCHMARK_SAMPLE.map((rec) => {
      const patientParams: PatientParameters = {
        age: rec.age,
        sex: rec.sex,
        cp: rec.cp,
        trestbps: rec.trestbps,
        chol: rec.chol,
        fbs: rec.fbs,
        restecg: rec.restecg,
        thalach: rec.thalach,
        exang: rec.exang,
        oldpeak: rec.oldpeak,
        slope: rec.slope,
        ca: rec.ca,
        thal: rec.thal,
      };

      const result = evaluateHeartDisease(patientParams, { threshold: activeThreshold });
      const predictedCad = result.probability >= activeThreshold ? 1 : 0;
      const isCorrect = predictedCad === rec.target;

      return {
        ...rec,
        params: patientParams,
        predictedProbability: result.probability,
        predictedCad,
        isCorrect,
        riskTier: result.riskTier,
      };
    });
  }, [activeThreshold]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return evaluatedRecords.filter((rec) => {
      // Filter by status
      if (filterMode === 'cad' && rec.target !== 1) return false;
      if (filterMode === 'normal' && rec.target !== 0) return false;
      if (filterMode === 'discrepancy' && rec.isCorrect) return false;

      // Filter by search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesAge = rec.age.toString().includes(term);
        const matchesSex = (rec.sex === 1 ? 'male' : 'female').includes(term);
        const matchesId = `patient ${rec.id}`.toLowerCase().includes(term) || rec.id.toString().includes(term);
        return matchesAge || matchesSex || matchesId;
      }
      return true;
    });
  }, [evaluatedRecords, filterMode, searchTerm]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'PatientID',
      'Age',
      'Sex',
      'ChestPainType',
      'RestingBP',
      'Cholesterol',
      'FastingBS',
      'RestECG',
      'MaxHR',
      'ExerciseAngina',
      'STDepression',
      'STSlope',
      'MajorVessels',
      'Thallium',
      'TrueCathTarget',
      'PredictedProbability',
      'PredictionOutcome',
    ];

    const rows = evaluatedRecords.map((r) => [
      r.id,
      r.age,
      r.sex === 1 ? 'Male' : 'Female',
      r.cp,
      r.trestbps,
      r.chol,
      r.fbs,
      r.restecg,
      r.thalach,
      r.exang,
      r.oldpeak,
      r.slope,
      r.ca,
      r.thal,
      r.target === 1 ? 'CAD Present (>50%)' : 'Normal / No Stenosis',
      (r.predictedProbability * 100).toFixed(1) + '%',
      r.predictedCad === 1 ? 'CAD Flagged' : 'Cleared',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CardioML_Cleveland_Evaluations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Cleveland Clinical Validation Cohort
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect individual patient records, compare catheterization ground truth vs ML predictions, and export batch data
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-md transition-colors font-medium self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Evaluation CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Patients ({evaluatedRecords.length})
          </button>
          <button
            onClick={() => setFilterMode('cad')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterMode === 'cad'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            True CAD Only ({evaluatedRecords.filter((r) => r.target === 1).length})
          </button>
          <button
            onClick={() => setFilterMode('normal')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterMode === 'normal'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            True Normal ({evaluatedRecords.filter((r) => r.target === 0).length})
          </button>
          <button
            onClick={() => setFilterMode('discrepancy')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterMode === 'discrepancy'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discrepancies ({evaluatedRecords.filter((r) => !r.isCorrect).length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search age, sex, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-56 bg-slate-950 border border-slate-800 text-slate-200 pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Demographic</th>
                <th className="py-2.5 px-3">Chest Pain</th>
                <th className="py-2.5 px-3">BP / Chol</th>
                <th className="py-2.5 px-3">Max HR</th>
                <th className="py-2.5 px-3">ST Dep. (ca)</th>
                <th className="py-2.5 px-3">Gold Standard Cath</th>
                <th className="py-2.5 px-3">ML Predicted</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredRecords.map((r) => {
                const probPercent = Math.round(r.predictedProbability * 100);
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-300">
                      #{r.id.toString().padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {r.age}y · {r.sex === 1 ? 'M' : 'F'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      Type {r.cp}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                      {r.trestbps} / {r.chol}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                      {r.thalach} bpm
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                      {r.oldpeak.toFixed(1)}mm ({r.ca}v)
                    </td>
                    <td className="py-2.5 px-3">
                      {r.target === 1 ? (
                        <span className="text-rose-400 font-medium font-sans">
                          CAD Present
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium font-sans">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold tabular-nums ${
                            r.predictedProbability >= activeThreshold
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {probPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          ({r.predictedCad === 1 ? 'Positive' : 'Negative'})
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {r.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-sans text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Match</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-sans text-[11px]">
                          <X className="w-3.5 h-3.5" />
                          <span>Discrepant</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onLoadPatient(r.params)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 rounded transition-colors whitespace-nowrap"
                      >
                        <span>Load in Lab</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
