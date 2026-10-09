import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Clock,
  Play,
  Square,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Database,
  BarChart2,
  FileText,
  HelpCircle,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  calculateDescriptiveStats,
  calculateSUSScore,
  computeTaskComparisons,
  generateSampleStudyData,
  STANDARD_STUDY_TASKS,
  DEFAULT_TRADITIONAL_BASELINES
} from '../utils/studyUtils';
import { logAudit } from '../utils/audit';

export default function ResearchDashboardPage({
  participants = [],
  taskTimings = [],
  surveys = [],
  isSampleActive = false,
  onSaveParticipants,
  onSaveTimings,
  onSaveSurveys,
  onSetSampleActive,
  onClearStudyData,
  currentRole = 'manager',
  currentLang = 'en'
}) {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics', 'timer', 'protocol', 'register', 'survey'

  // Task Timer State
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(STANDARD_STUDY_TASKS[0].id);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [taskNotes, setTaskNotes] = useState('');

  // New Participant Register Form
  const [newPartRole, setNewPartRole] = useState('Farmer');
  const [newPartLang, setNewPartLang] = useState('kn');
  const [newPartLiteracy, setNewPartLiteracy] = useState('Moderate');
  const [newPartConsent, setNewPartConsent] = useState(true);

  // SUS Survey Form State
  const [surveyParticipantId, setSurveyParticipantId] = useState('');
  const [surveyAnswers, setSurveyAnswers] = useState([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);

  // Stopwatch effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handlers for Participant Registration
  const handleRegisterParticipant = (e) => {
    e.preventDefault();
    const nextId = `P${String(participants.length + 1).padStart(3, '0')}`;
    const newP = {
      id: nextId,
      roleGroup: newPartRole,
      language: newPartLang,
      digitalLiteracy: newPartLiteracy,
      consentRecorded: newPartConsent,
      registeredAt: new Date().toISOString()
    };
    const updated = [...participants, newP];
    onSaveParticipants(updated);
    logAudit({
      action: 'STUDY_PARTICIPANT_REGISTERED',
      userRole: currentRole,
      entityId: nextId,
      entityType: 'Study Participant',
      notes: `Registered participant ${nextId} (${newPartRole}, ${newPartLang})`
    });
    alert(`Participant ${nextId} registered successfully.`);
  };

  // Timer Handlers
  const handleStartTimer = () => {
    if (!selectedParticipantId) {
      alert('Please select an enrolled Participant ID before starting the timer.');
      return;
    }
    setTimerSeconds(0);
    setErrorCount(0);
    setIsTimerRunning(true);
  };

  const handleStopTimer = (status = 'SUCCESS') => {
    setIsTimerRunning(false);
    const timingRecord = {
      id: `TIM-${Date.now()}`,
      participantId: selectedParticipantId,
      taskId: selectedTaskId,
      durationSec: timerSeconds,
      status,
      errorCount,
      notes: taskNotes,
      recordedAt: new Date().toISOString()
    };
    const updated = [...taskTimings, timingRecord];
    onSaveTimings(updated);
    logAudit({
      action: 'STUDY_TASK_COMPLETED',
      userRole: currentRole,
      entityId: timingRecord.id,
      entityType: 'Study Timing',
      notes: `Task ${selectedTaskId} by ${selectedParticipantId}: ${timerSeconds}s (${status})`
    });
    alert(`Task timing recorded: ${timerSeconds} seconds (${status}).`);
  };

  // Survey Submit Handler
  const handleSaveSurvey = (e) => {
    e.preventDefault();
    if (!surveyParticipantId) {
      alert('Please select a participant.');
      return;
    }
    const record = {
      id: `SURV-${Date.now()}`,
      participantId: surveyParticipantId,
      responses: surveyAnswers,
      submittedAt: new Date().toISOString()
    };
    const updated = [...surveys, record];
    onSaveSurveys(updated);
    alert('SUS questionnaire responses saved.');
  };

  // Sample Data Toggle
  const handleToggleSampleData = () => {
    if (isSampleActive) {
      onClearStudyData();
      alert('Sample study data removed.');
    } else {
      const sample = generateSampleStudyData();
      onSaveParticipants(sample.participants);
      onSaveTimings(sample.timings);
      onSaveSurveys(sample.surveys);
      onSetSampleActive(true);
      alert('Sample study dataset loaded for 15 participants. Clearly labeled as demo data.');
    }
  };

  // Compute Metrics from Actual Data
  const taskComparisons = computeTaskComparisons(taskTimings);
  const susScores = surveys.map(s => calculateSUSScore(s.responses)).filter(Boolean);
  const avgSUS = susScores.length > 0 ? (susScores.reduce((acc, s) => acc + s.score, 0) / susScores.length).toFixed(1) : null;
  const completedTasksCount = taskTimings.filter(t => t.status === 'SUCCESS').length;

  // CSV Exporter
  const handleExportCSV = () => {
    let csv = 'ParticipantID,TaskID,DurationSeconds,Status,ErrorCount,RecordedAt\n';
    taskTimings.forEach(t => {
      csv += `"${t.participantId}","${t.taskId}",${t.durationSec},"${t.status}",${t.errorCount},"${t.recordedAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrisahay_study_timings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Persistent Sample Data Warning Banner */}
      {isSampleActive && (
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef08a', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.8125rem', color: '#92400e', fontWeight: 600 }}>
              Sample / Demo Study Data Active: Numbers displayed are illustrative sample artifacts for testing and demonstration, NOT actual academic research results.
            </span>
          </div>
          <button
            onClick={handleToggleSampleData}
            style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
          >
            Remove Sample Data
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              Empirical Research Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Academic Usability & Field Evaluation Framework
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Research Evaluation Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Records real usability task timings, SUS questionnaires, and baseline comparisons across rural cohorts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleSampleData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: isSampleActive ? '#fef2f2' : '#ffffff',
              color: isSampleActive ? '#dc2626' : '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Database size={15} />
            {isSampleActive ? 'Remove Sample Data' : 'Load Sample Study Data'}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={taskTimings.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: taskTimings.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={15} /> Export Study CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', gap: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{ padding: '0.625rem 1rem', border: 'none', borderBottom: activeTab === 'metrics' ? '2px solid #15803d' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: activeTab === 'metrics' ? '#15803d' : '#64748b', cursor: 'pointer' }}
        >
          Computed Metrics & Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          style={{ padding: '0.625rem 1rem', border: 'none', borderBottom: activeTab === 'timer' ? '2px solid #15803d' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: activeTab === 'timer' ? '#15803d' : '#64748b', cursor: 'pointer' }}
        >
          Live Task Stopwatch & Recorder
        </button>
        <button
          onClick={() => setActiveTab('survey')}
          style={{ padding: '0.625rem 1rem', border: 'none', borderBottom: activeTab === 'survey' ? '2px solid #15803d' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: activeTab === 'survey' ? '#15803d' : '#64748b', cursor: 'pointer' }}
        >
          SUS Usability Survey Form
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{ padding: '0.625rem 1rem', border: 'none', borderBottom: activeTab === 'register' ? '2px solid #15803d' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: activeTab === 'register' ? '#15803d' : '#64748b', cursor: 'pointer' }}
        >
          Enrolled Participants ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab('protocol')}
          style={{ padding: '0.625rem 1rem', border: 'none', borderBottom: activeTab === 'protocol' ? '2px solid #15803d' : '2px solid transparent', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: activeTab === 'protocol' ? '#15803d' : '#64748b', cursor: 'pointer' }}
        >
          Study Protocol & 7 Research Questions
        </button>
      </div>

      {/* TAB 1: COMPUTED METRICS */}
      {activeTab === 'metrics' && (
        <div>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enrolled Subjects (N)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{participants.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>Anonymized (P001 format)</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Recorded Task Trials</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{taskTimings.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{completedTasksCount} Completed Cleanly</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mean SUS Usability Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: avgSUS ? '#15803d' : '#94a3b8', marginTop: '0.25rem' }}>
                {avgSUS ? `${avgSUS} / 100` : 'No Data Yet'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                {avgSUS ? 'System Usability Scale' : 'Needs Survey Submissions'}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Traditional vs AgriSahay</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>
                {taskComparisons.filter(t => t.timeReductionPercent !== null).length > 0 ? 'Empirically Timed' : 'Pending Tasks'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Side-by-side efficiency</div>
            </div>
          </div>

          {/* Baseline Comparisons Table */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Standard Task Timing Comparison: Traditional Banking vs AgriSahay
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Timings recorded in seconds (Mean & Median)
              </span>
            </div>

            {taskTimings.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <Clock size={36} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto', display: 'block' }} />
                <strong>No study data collected yet.</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  Use the "Live Task Stopwatch" to record real session timings or click "Load Sample Study Data" to preview metrics.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.625rem 1rem' }}>Task ID & Title</th>
                      <th style={{ padding: '0.625rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Trials (N)</th>
                      <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Traditional Manual Time</th>
                      <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>AgriSahay Mean Time</th>
                      <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>AgriSahay Median</th>
                      <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Time Reduction</th>
                      <th style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskComparisons.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                          <span style={{ color: '#2563eb', marginRight: '0.5rem' }}>{t.id}</span>
                          {t.title}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{t.category}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{t.sampleCount}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#475569' }}>
                          {Math.round(t.traditionalSec / 60)} min ({t.traditionalSec}s)
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: t.agriSahayAvgSec ? '#15803d' : '#94a3b8' }}>
                          {t.agriSahayAvgSec ? `${Math.round(t.agriSahayAvgSec)}s (${(t.agriSahayAvgSec / 60).toFixed(1)}m)` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#64748b' }}>
                          {t.agriSahayMedianSec ? `${t.agriSahayMedianSec}s` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {t.timeReductionPercent !== null ? (
                            <span style={{ fontWeight: 700, color: t.timeReductionPercent > 0 ? '#15803d' : '#b91c1c' }}>
                              {t.timeReductionPercent > 0 ? `-${t.timeReductionPercent}%` : `+${Math.abs(t.timeReductionPercent)}%`}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {t.sampleCount > 0 ? `${t.errorRatePercent}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE TASK STOPWATCH */}
      {activeTab === 'timer' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Live Task Stopwatch & Error Logger
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
            Select an enrolled participant and standard task. Time begins when instructions are read to the participant.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Participant ID
              </label>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value="">-- Select Participant --</option>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} ({p.roleGroup} - {p.language?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Task to Evaluate
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {STANDARD_STUDY_TASKS.map(t => (
                  <option key={t.id} value={t.id}>{t.id} – {t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Large Digital Stopwatch Display */}
          <div style={{ backgroundColor: '#0f172a', color: '#22c55e', borderRadius: '8px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '2px' }}>
              {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
              {(timerSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              {isTimerRunning ? '● RECORDING LIVE TIME' : 'STOPPED'}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                style={{ flex: 1, backgroundColor: '#15803d', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Play size={18} /> Start Task Timer
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleStopTimer('SUCCESS')}
                  style={{ flex: 1, backgroundColor: '#15803d', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Square size={18} /> Finish (Success)
                </button>
                <button
                  onClick={() => handleStopTimer('ASSISTED')}
                  style={{ flex: 1, backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Finish (With Assistance)
                </button>
                <button
                  onClick={() => handleStopTimer('FAILED')}
                  style={{ flex: 1, backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Aborted / Failed
                </button>
              </>
            )}
          </div>

          {/* Error & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Logged Navigation Errors
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setErrorCount(c => Math.max(0, c - 1))}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >-</button>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{errorCount}</span>
                <button
                  type="button"
                  onClick={() => setErrorCount(c => c + 1)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >+</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Researcher Observation Notes
              </label>
              <input
                type="text"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="e.g. Struggled locating regional language toggle in sidebar..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUS USABILITY SURVEY */}
      {activeTab === 'survey' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            System Usability Scale (SUS) Standard 10-Item Questionnaire
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
            John Brooke (1986) standard usability evaluation. Responses on 1-5 scale (1: Strongly Disagree, 5: Strongly Agree).
          </p>

          <form onSubmit={handleSaveSurvey}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Respondent Participant ID
              </label>
              <select
                value={surveyParticipantId}
                onChange={(e) => setSurveyParticipantId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                required
              >
                <option value="">-- Select Participant --</option>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.id} ({p.roleGroup} - {p.language})</option>
                ))}
              </select>
            </div>

            {[
              "1. I think that I would like to use this system frequently.",
              "2. I found the system unnecessarily complex.",
              "3. I thought the system was easy to use.",
              "4. I think that I would need the support of a technical person to be able to use this system.",
              "5. I found the various functions in this system were well integrated.",
              "6. I thought there was too much inconsistency in this system.",
              "7. I would imagine that most people would learn to use this system very quickly.",
              "8. I found the system very cumbersome to use.",
              "9. I felt very confident using the system.",
              "10. I needed to learn a lot of things before I could get going with this system."
            ].map((qText, idx) => (
              <div key={idx} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                  {qText}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '400px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Strongly Disagree (1)</span>
                  {[1, 2, 3, 4, 5].map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`sus_${idx}`}
                        value={v}
                        checked={surveyAnswers[idx] === v}
                        onChange={() => {
                          const updated = [...surveyAnswers];
                          updated[idx] = v;
                          setSurveyAnswers(updated);
                        }}
                      />
                      {v}
                    </label>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Strongly Agree (5)</span>
                </div>
              </div>
            ))}

            <button
              type="submit"
              style={{ marginTop: '1.5rem', backgroundColor: '#15803d', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Record Survey Response
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ENROLLED PARTICIPANTS */}
      {activeTab === 'register' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Registration Form */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
              Enroll Study Participant
            </h3>
            <form onSubmit={handleRegisterParticipant} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Role Group
                </label>
                <select
                  value={newPartRole}
                  onChange={(e) => setNewPartRole(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                >
                  <option value="Farmer">Farmer (Cultivator)</option>
                  <option value="Field Officer">Field Relationship Officer</option>
                  <option value="Branch Manager">Branch Manager / Approver</option>
                  <option value="Rural Customer">Rural Banking Customer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Primary Language
                </label>
                <select
                  value={newPartLang}
                  onChange={(e) => setNewPartLang(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                >
                  <option value="kn">ಕನ್ನಡ – Kannada</option>
                  <option value="hi">हिन्दी – Hindi</option>
                  <option value="ta">தமிழ் – Tamil</option>
                  <option value="te">తెలుగు – Telugu</option>
                  <option value="mr">मराठी – Marathi</option>
                  <option value="bn">বাংলা – Bengali</option>
                  <option value="ml">മലയാളം – Malayalam</option>
                  <option value="gu">ગુજરાતી – Gujarati</option>
                  <option value="pa">ਪੰਜਾਬੀ – Punjabi</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Digital Literacy Level
                </label>
                <select
                  value={newPartLiteracy}
                  onChange={(e) => setNewPartLiteracy(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                >
                  <option value="Low">Low (Basic feature-phone user)</option>
                  <option value="Moderate">Moderate (Uses smartphone apps)</option>
                  <option value="High">High (Fluent with banking apps)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={newPartConsent}
                  onChange={(e) => setNewPartConsent(e.target.checked)}
                  required
                />
                <label htmlFor="consentCheck" style={{ fontSize: '0.8125rem', color: '#334155' }}>
                  Informed Consent Recorded (Right to withdraw anytime)
                </label>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#15803d', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}
              >
                Enroll Anonymous Participant
              </button>
            </form>
          </div>

          {/* Enrolled Table */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Enrolled Cohort ({participants.length} Subjects)
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Participant ID</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Role Group</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Language</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Digital Literacy</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Consent Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>{p.id}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{p.roleGroup}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textTransform: 'uppercase' }}>{p.language}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{p.digitalLiteracy}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#15803d' }}>✓ Recorded</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDY PROTOCOL & 7 RESEARCH QUESTIONS */}
      {activeTab === 'protocol' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            AgriSahay Research Protocol & 7 Central Questions
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
            Research Title: <em>"AgriSahay: An Explainable, Offline-First, Multilingual and Climate-Aware Agriculture Lending Platform for Inclusive Rural Credit Delivery"</em>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: "1. Does harvest-linked repayment planning improve the suitability of agricultural loan schedules?",
                indicator: "Default risk reduction during crop gestation; elimination of technical defaults during non-cash vegetative months."
              },
              {
                q: "2. Does multilingual full-page translation improve task completion and farmer understanding?",
                indicator: "Time reduction on terminology lookups; SUS comprehension scores in regional languages (Kannada, Hindi, etc.)."
              },
              {
                q: "3. Does offline field collection reduce verification time in low-connectivity areas?",
                indicator: "Elapsed field inspection duration; sync conflict resolution success rate with zero data loss."
              },
              {
                q: "4. Does an explainable resilience index improve consistency of officer risk assessment?",
                indicator: "Variance in underwriting recommendations across relationship officers; audit trail justification of overrides."
              },
              {
                q: "5. Does integrating crop-insurance support improve post-loss assistance?",
                indicator: "Time from localized weather loss intimation to 72-hour formal claim logging and loan restructuring recommendation."
              },
              {
                q: "6. Can climate-risk information improve early intervention without unfairly denying credit?",
                indicator: "Aggregated fairness monitoring across rainfed vs irrigated cohorts; adoption of compensating safeguards over outright rejections."
              },
              {
                q: "7. Does the platform reduce operational workload for branch staff?",
                indicator: "Automated Scale of Finance calculation, instant tamper-evident audit hashing, and rapid docket export."
              }
            ].map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {item.q}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#15803d' }}>
                  <strong>Key Empirical Measure:</strong> {item.indicator}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.8125rem', color: '#1e40af' }}>
            <strong>Ethical Governance & Participant Rights:</strong> All study subjects are anonymized using arbitrary identification tags (P001, P002). No personal telephone numbers, Aadhaar credentials, or real bank balances are stored. Participants retain the unconditional right to withdraw and purge their trial data at any moment.
          </div>
        </div>
      )}
    </div>
  );
}
