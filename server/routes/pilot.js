// Pilot Evaluation Study & SUS Usability Survey Routes (Brooke 1986)
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logServerAudit } from '../middleware/auditLogger.js';

const router = express.Router();

// GET /api/pilot/participants - List enrolled participants
router.get('/participants', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    res.json({ success: true, count: db.tables.pilot_study_participants.length, data: db.tables.pilot_study_participants });
  } catch (err) {
    next(err);
  }
});

// POST /api/pilot/participants - Enroll participant
router.post('/participants', authenticateToken, requireRole(['RESEARCHER', 'BRANCH_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const db = await getDb();
    const { participant_type, role_group, preferred_language, digital_literacy } = req.body;

    const newParticipant = {
      id: `P-${String(db.tables.pilot_study_participants.length + 1).padStart(3, '0')}`,
      participant_type: participant_type || 'Agricultural Borrower',
      role_group: role_group || 'Farmer',
      preferred_language: preferred_language || 'kn',
      digital_literacy: digital_literacy || 'Moderate',
      informed_consent_signed: true,
      created_at: new Date().toISOString()
    };

    db.tables.pilot_study_participants.push(newParticipant);

    await logServerAudit({
      action: 'PILOT_PARTICIPANT_ENROLLED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newParticipant.id,
      entityType: 'Pilot Evaluation',
      notes: `Enrolled participant ${newParticipant.id} (${newParticipant.participant_type}, Language: ${newParticipant.preferred_language}).`
    });

    res.status(201).json({ success: true, data: newParticipant });
  } catch (err) {
    next(err);
  }
});

// POST /api/pilot/tasks - Record empirical task timing
router.post('/tasks', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { participant_id, task_code, start_time, completion_time, elapsed_seconds, error_count, assistance_required, task_status, notes } = req.body;

    const newTask = {
      id: `TSK-${Date.now()}`,
      participant_id,
      task_code,
      start_time: start_time || new Date().toISOString(),
      completion_time: completion_time || new Date().toISOString(),
      elapsed_seconds: Number(elapsed_seconds),
      error_count: Number(error_count || 0),
      assistance_required: Boolean(assistance_required),
      task_status: task_status || 'SUCCESS',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    db.tables.pilot_study_tasks.push(newTask);

    await logServerAudit({
      action: 'PILOT_TASK_RECORDED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newTask.id,
      entityType: 'Pilot Evaluation',
      notes: `Recorded benchmark task ${task_code} for ${participant_id}. Time: ${newTask.elapsed_seconds}s, Errors: ${newTask.error_count}.`
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    next(err);
  }
});

// POST /api/pilot/surveys - Record Brooke (1986) 10-Item SUS Survey
router.post('/surveys', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const { participant_id, language, responses, comprehension_rating, trust_rating, resilience_clarity_rating, qualitative_feedback } = req.body;

    if (!Array.isArray(responses) || responses.length !== 10) {
      return res.status(400).json({ success: false, error: 'INVALID_SUS_RESPONSES', message: 'Array of exactly 10 responses (ratings 1-5) is required.' });
    }

    // Brooke (1986) formula:
    // Odd (0, 2, 4, 6, 8): response - 1
    // Even (1, 3, 5, 7, 9): 5 - response
    let totalScore = 0;
    for (let i = 0; i < 10; i++) {
      const val = Math.max(1, Math.min(5, Number(responses[i])));
      if (i % 2 === 0) totalScore += (val - 1);
      else totalScore += (5 - val);
    }
    const compositeSUS = Number((totalScore * 2.5).toFixed(2));

    let grade = 'F';
    if (compositeSUS >= 85) grade = 'A+';
    else if (compositeSUS >= 80) grade = 'A';
    else if (compositeSUS >= 68) grade = 'B';
    else if (compositeSUS >= 50) grade = 'C';

    const newSurvey = {
      id: `SURV-${Date.now()}`,
      participant_id,
      language: language || 'kn',
      sus_responses: responses,
      sus_composite_score: compositeSUS,
      sus_grade: grade,
      comprehension_rating: Number(comprehension_rating || 4),
      trust_rating: Number(trust_rating || 4),
      resilience_clarity_rating: Number(resilience_clarity_rating || 4),
      qualitative_feedback: qualitative_feedback || '',
      created_at: new Date().toISOString()
    };

    db.tables.pilot_study_surveys.push(newSurvey);

    await logServerAudit({
      action: 'PILOT_SUS_SURVEY_RECORDED',
      userId: req.user.id,
      userRole: req.user.role,
      entityId: newSurvey.id,
      entityType: 'Pilot Evaluation',
      notes: `Recorded SUS Survey for ${participant_id}. Composite Score: ${compositeSUS} (${grade}).`
    });

    res.status(201).json({ success: true, data: newSurvey });
  } catch (err) {
    next(err);
  }
});

// GET /api/pilot/aggregates - Anonymized aggregate research metrics
router.get('/aggregates', authenticateToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const tasks = db.tables.pilot_study_tasks;
    const surveys = db.tables.pilot_study_surveys;

    if (tasks.length === 0 && surveys.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: 'No empirical pilot study data collected yet. Show baseline protocol or sample toggle.'
      });
    }

    // Task completion times by task code
    const taskBreakdown = {};
    const taskCodes = ['T1_FARMER_REG', 'T2_FIELD_VISIT', 'T3_LOAN_REVIEW', 'T4_HARVEST_PLAN', 'T5_CROP_LOSS', 'T6_LANG_SEARCH'];
    taskCodes.forEach(tc => {
      const matched = tasks.filter(t => t.task_code === tc);
      if (matched.length > 0) {
        const times = matched.map(m => m.elapsed_seconds);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const errs = matched.reduce((a, b) => a + b.error_count, 0);
        taskBreakdown[tc] = {
          sampleCount: matched.length,
          avgSeconds: Number(avg.toFixed(1)),
          totalErrors: errs,
          errorRatePct: Number(((errs / matched.length) * 100).toFixed(1))
        };
      }
    });

    // SUS Aggregates
    const susScores = surveys.map(s => s.sus_composite_score);
    const avgSUS = susScores.length > 0 ? Number((susScores.reduce((a, b) => a + b, 0) / susScores.length).toFixed(1)) : 0;

    const compRatings = surveys.map(s => s.comprehension_rating);
    const avgComp = compRatings.length > 0 ? Number((compRatings.reduce((a, b) => a + b, 0) / compRatings.length).toFixed(1)) : 0;

    const trustRatings = surveys.map(s => s.trust_rating);
    const avgTrust = trustRatings.length > 0 ? Number((trustRatings.reduce((a, b) => a + b, 0) / trustRatings.length).toFixed(1)) : 0;

    res.json({
      success: true,
      hasData: true,
      totalParticipants: db.tables.pilot_study_participants.length,
      totalTasksExecuted: tasks.length,
      totalSurveysCompleted: surveys.length,
      avgSUSScore: avgSUS,
      avgComprehension: avgComp,
      avgTrust: avgTrust,
      taskMetrics: taskBreakdown
    });
  } catch (err) {
    next(err);
  }
});

export default router;
