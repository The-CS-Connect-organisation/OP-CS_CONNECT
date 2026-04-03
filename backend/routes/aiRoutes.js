import { Router } from 'express';
import multer from 'multer';
import {
  assignmentFeedback,
  attendanceInsights,
  doubtSolver,
  gradePredictor,
  quizGenerator,
  studyPlanner,
  summaryGenerator,
} from '../controllers/aiController.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  assignmentFeedbackSchema,
  attendanceInsightsSchema,
  doubtSolverSchema,
  gradePredictorSchema,
  quizGeneratorSchema,
  studyPlannerSchema,
} from '../validators/aiValidators.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth);

router.post('/doubt-solver', allowRoles('student'), validateRequest(doubtSolverSchema), doubtSolver);
router.post('/study-planner', allowRoles('student'), validateRequest(studyPlannerSchema), studyPlanner);
router.post('/grade-predictor', allowRoles('student'), validateRequest(gradePredictorSchema), gradePredictor);
router.post('/assignment-feedback', allowRoles('teacher', 'admin'), validateRequest(assignmentFeedbackSchema), assignmentFeedback);
router.post('/summary-generator', allowRoles('student', 'teacher', 'admin'), upload.single('pdf'), summaryGenerator);
router.post('/quiz-generator', allowRoles('teacher', 'admin'), validateRequest(quizGeneratorSchema), quizGenerator);
router.post('/attendance-insights', allowRoles('teacher', 'admin', 'parent'), validateRequest(attendanceInsightsSchema), attendanceInsights);

export default router;
