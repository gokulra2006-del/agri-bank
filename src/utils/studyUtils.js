// Research Evaluation & Statistical Utilities for AgriSahay Academic Study
// Evaluates real recorded participant sessions, SUS usability scores, and baseline comparisons.
// Principle: No fabricated results. Show "No study data collected yet" when datasets are empty.

/**
 * Calculates descriptive statistics for a numeric array.
 */
export function calculateDescriptiveStats(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return { count: 0, mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
  }

  const clean = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  const count = clean.length;
  if (count === 0) {
    return { count: 0, mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
  }

  const sorted = [...clean].sort((a, b) => a - b);
  const sum = clean.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;

  let median = 0;
  if (count % 2 === 0) {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  } else {
    median = sorted[Math.floor(count / 2)];
  }

  const variance = clean.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    min: sorted[0],
    max: sorted[count - 1]
  };
}

/**
 * Computes System Usability Scale (SUS) score for a 10-item questionnaire.
 * Each response is 1-5 (Strongly Disagree to Strongly Agree).
 * Formula:
 * - Odd items (1,3,5,7,9): response - 1
 * - Even items (2,4,6,8,10): 5 - response
 * - Multiply total sum by 2.5 (yields 0 - 100 score)
 */
export function calculateSUSScore(responses) {
  if (!Array.isArray(responses) || responses.length !== 10) {
    return null;
  }
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const val = Number(responses[i]);
    if (isNaN(val) || val < 1 || val > 5) return null;
    if (i % 2 === 0) {
      // 1st, 3rd, 5th, 7th, 9th item (0-indexed: 0, 2, 4, 6, 8)
      sum += (val - 1);
    } else {
      // 2nd, 4th, 6th, 8th, 10th item (0-indexed: 1, 3, 5, 7, 9)
      sum += (5 - val);
    }
  }
  const score = sum * 2.5;
  let grade = 'F';
  let adjective = 'Poor';
  if (score >= 85) { grade = 'A+'; adjective = 'Excellent'; }
  else if (score >= 80) { grade = 'A'; adjective = 'Good'; }
  else if (score >= 68) { grade = 'B'; adjective = 'OK / Acceptable'; }
  else if (score >= 50) { grade = 'C'; adjective = 'Marginal'; }

  return {
    score: Number(score.toFixed(1)),
    grade,
    adjective
  };
}

/**
 * Standard Tasks in the AgriSahay Usability Protocol
 */
export const STANDARD_STUDY_TASKS = [
  { id: 'T1_FARMER_REG', title: 'Register New Farmer & Plot', category: 'Field Ops', benchmarkSec: 900 },
  { id: 'T2_FIELD_VISIT', title: 'Conduct & Sync Field Inspection', category: 'Field Ops', benchmarkSec: 720 },
  { id: 'T3_LOAN_REVIEW', title: 'Maker-Checker Loan Underwriting', category: 'Branch Ops', benchmarkSec: 1200 },
  { id: 'T4_HARVEST_PLAN', title: 'Create Harvest Repayment Schedule', category: 'Credit Planning', benchmarkSec: 600 },
  { id: 'T5_CROP_LOSS', title: 'Report Crop Loss & Intimate Claim', category: 'Credit Protection', benchmarkSec: 840 },
  { id: 'T6_LANG_SEARCH', title: 'Switch Regional Language & Locate Term', category: 'Accessibility', benchmarkSec: 300 }
];

/**
 * Baseline manual process timings (in seconds) for comparison
 */
export const DEFAULT_TRADITIONAL_BASELINES = {
  T1_FARMER_REG: 1200,   // Manual paper form & travel: 20 min
  T2_FIELD_VISIT: 960,    // Paper diary notes: 16 min
  T3_LOAN_REVIEW: 1800,   // Physical branch committee: 30 min
  T4_HARVEST_PLAN: 900,   // Manual interest calculator: 15 min
  T5_CROP_LOSS: 1500,     // Paper loss intimation to district: 25 min
  T6_LANG_SEARCH: 600     // Seeking branch interpreter: 10 min
};

/**
 * Computes comparative task efficiency metrics between Traditional and AgriSahay.
 */
export function computeTaskComparisons(taskTimings = [], customBaselines = DEFAULT_TRADITIONAL_BASELINES) {
  return STANDARD_STUDY_TASKS.map(task => {
    const records = taskTimings.filter(t => t.taskId === task.id && t.status === 'SUCCESS');
    const traditionalSec = customBaselines[task.id] || task.benchmarkSec;
    if (records.length === 0) {
      return {
        ...task,
        sampleCount: 0,
        agriSahayAvgSec: null,
        traditionalSec,
        timeReductionPercent: null,
        errorRatePercent: 0
      };
    }

    const times = records.map(r => r.durationSec);
    const stats = calculateDescriptiveStats(times);
    const errors = taskTimings.filter(t => t.taskId === task.id && t.errorCount > 0).length;
    const errorRate = (errors / taskTimings.filter(t => t.taskId === task.id).length) * 100;
    const reduction = ((traditionalSec - stats.mean) / traditionalSec) * 100;

    return {
      ...task,
      sampleCount: records.length,
      agriSahayAvgSec: stats.mean,
      agriSahayMedianSec: stats.median,
      traditionalSec,
      timeReductionPercent: Number(reduction.toFixed(1)),
      errorRatePercent: Number(errorRate.toFixed(1))
    };
  });
}

/**
 * Sample dataset generator for study demonstration purposes.
 * Strictly labeled: "Sample/demo data, not real study results".
 */
export function generateSampleStudyData() {
  const participants = [
    { id: 'P001', roleGroup: 'Field Officer', language: 'kn', digitalLiteracy: 'Moderate', consentRecorded: true },
    { id: 'P002', roleGroup: 'Farmer', language: 'kn', digitalLiteracy: 'Low', consentRecorded: true },
    { id: 'P003', roleGroup: 'Branch Manager', language: 'en', digitalLiteracy: 'High', consentRecorded: true },
    { id: 'P004', roleGroup: 'Farmer', language: 'hi', digitalLiteracy: 'Low', consentRecorded: true },
    { id: 'P005', roleGroup: 'Field Officer', language: 'te', digitalLiteracy: 'Moderate', consentRecorded: true },
    { id: 'P006', roleGroup: 'Rural Customer', language: 'ta', digitalLiteracy: 'Moderate', consentRecorded: true },
    { id: 'P007', roleGroup: 'Branch Manager', language: 'kn', digitalLiteracy: 'High', consentRecorded: true },
    { id: 'P008', roleGroup: 'Farmer', language: 'mr', digitalLiteracy: 'Low', consentRecorded: true },
    { id: 'P009', roleGroup: 'Field Officer', language: 'hi', digitalLiteracy: 'High', consentRecorded: true },
    { id: 'P010', roleGroup: 'Rural Customer', language: 'bn', digitalLiteracy: 'Moderate', consentRecorded: true },
    { id: 'P011', roleGroup: 'Farmer', language: 'gu', digitalLiteracy: 'Low', consentRecorded: true },
    { id: 'P012', roleGroup: 'Field Officer', language: 'pa', digitalLiteracy: 'Moderate', consentRecorded: true },
    { id: 'P013', roleGroup: 'Branch Manager', language: 'en', digitalLiteracy: 'High', consentRecorded: true },
    { id: 'P014', roleGroup: 'Farmer', language: 'ml', digitalLiteracy: 'Moderate', consentRecorded: true },
    { id: 'P015', roleGroup: 'Field Officer', language: 'kn', digitalLiteracy: 'Moderate', consentRecorded: true }
  ];

  const timings = [];
  const taskDurations = {
    T1_FARMER_REG: [310, 280, 345, 290, 420, 310, 275, 330, 295, 315, 380, 290, 260, 340, 305],
    T2_FIELD_VISIT: [220, 240, 210, 260, 290, 230, 195, 250, 215, 225, 270, 240, 205, 255, 210],
    T3_LOAN_REVIEW: [420, 390, 450, 410, 480, 430, 380, 460, 415, 425, 510, 430, 370, 470, 400],
    T4_HARVEST_PLAN: [180, 195, 160, 210, 230, 175, 150, 220, 190, 185, 240, 195, 155, 205, 170],
    T5_CROP_LOSS: [260, 290, 240, 310, 330, 270, 230, 300, 280, 275, 350, 290, 240, 320, 265],
    T6_LANG_SEARCH: [85, 95, 70, 110, 125, 90, 65, 115, 80, 95, 130, 90, 60, 105, 85]
  };

  participants.forEach((p, idx) => {
    STANDARD_STUDY_TASKS.forEach(t => {
      timings.push({
        id: `TIM-${p.id}-${t.id}`,
        participantId: p.id,
        taskId: t.id,
        durationSec: taskDurations[t.id][idx],
        status: 'SUCCESS',
        errorCount: (idx % 4 === 0) ? 1 : 0,
        recordedAt: '2026-09-15T10:00:00Z',
        isSample: true
      });
    });
  });

  const surveys = participants.map((p, idx) => {
    // Generate realistic responses: mostly 4s and 5s for positive items, 1s and 2s for negative
    const base = [
      4 + (idx % 2), // Q1: I think that I would like to use this system frequently.
      2 - (idx % 2), // Q2: I found the system unnecessarily complex.
      4 + (idx % 2), // Q3: I thought the system was easy to use.
      1 + (idx % 2), // Q4: I think that I would need the support of a technical person...
      4 + (idx % 2), // Q5: I found the various functions in this system were well integrated.
      2 - (idx % 2), // Q6: I thought there was too much inconsistency in this system.
      4 + (idx % 2), // Q7: I would imagine that most people would learn to use this system very quickly.
      1 + (idx % 2), // Q8: I found the system very cumbersome to use.
      4 + (idx % 2), // Q9: I felt very confident using the system.
      2 - (idx % 2)  // Q10: I needed to learn a lot of things before I could get going with this system.
    ];
    return {
      id: `SURV-${p.id}`,
      participantId: p.id,
      roleGroup: p.roleGroup,
      language: p.language,
      responses: base,
      comprehensionRating: 4 + (idx % 2), // 1-5
      trustRating: 4 + (idx % 2),         // 1-5
      resilienceClarityRating: 4,         // 1-5
      submittedAt: '2026-09-15T11:00:00Z',
      isSample: true
    };
  });

  return { participants, timings, surveys };
}

/**
 * Enforces privacy threshold (k-anonymity): suppress any aggregate bucket with fewer than 5 records.
 */
export function checkPrivacyThreshold(count, threshold = 5) {
  if (count < threshold) {
    return {
      isSuppressed: true,
      displayValue: `< ${threshold} (Suppressed for Privacy)`,
      reason: `Group size is below minimum threshold (N < ${threshold}) to protect borrower anonymity under DPDP guidelines.`
    };
  }
  return {
    isSuppressed: false,
    displayValue: String(count),
    reason: null
  };
}
