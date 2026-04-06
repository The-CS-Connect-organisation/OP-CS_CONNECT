import * as pdfParseModule from 'pdf-parse';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { completeWithOpenRouter, streamWithOpenRouter } from '../services/openrouter.js';

const systemPrompt = (role) =>
  `You are an expert school assistant AI for ${role}. Keep responses clear, actionable, and age-appropriate.`;
const pdfParse = pdfParseModule.default ?? pdfParseModule;

const toMetadata = (req, feature, prompt, subject, model) => ({
  userId: req.user.id,
  feature,
  prompt,
  subject,
  model,
});

export const doubtSolver = asyncHandler(async (req, res) => {
  const { question, subject, model, stream } = req.body;
  const messages = [
    { role: 'system', content: `${systemPrompt('students')} Subject context: ${subject}.` },
    { role: 'user', content: question },
  ];

  if (stream) {
    await streamWithOpenRouter({
      req,
      res,
      messages,
      model,
      metadata: toMetadata(req, 'doubt_solver', question, subject, model),
    });
    return;
  }

  const result = await completeWithOpenRouter({
    messages,
    model,
    metadata: toMetadata(req, 'doubt_solver', question, subject, model),
  });

  res.json({ success: true, answer: result.content, usage: result.usage });
});

export const studyPlanner = asyncHandler(async (req, res) => {
  const { exams, hoursPerDay, model } = req.body;
  const prompt = `Create a study schedule with ${hoursPerDay} hours/day for exams: ${JSON.stringify(exams)}.
Include daily plan, revision windows, and rest buffers.`;
  const result = await completeWithOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt('students') },
      { role: 'user', content: prompt },
    ],
    model,
    metadata: toMetadata(req, 'study_planner', prompt, 'multi-subject', model),
  });
  res.json({ success: true, plan: result.content, usage: result.usage });
});

export const gradePredictor = asyncHandler(async (req, res) => {
  const { marks, subject, examType, model } = req.body;
  const prompt = `Predict likely score for ${examType} in ${subject} based on marks history ${marks.join(', ')}.
Return predicted range, confidence, and improvement suggestions.`;
  const result = await completeWithOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt('students') },
      { role: 'user', content: prompt },
    ],
    model,
    metadata: toMetadata(req, 'grade_predictor', prompt, subject, model),
  });
  res.json({ success: true, prediction: result.content, usage: result.usage });
});

export const assignmentFeedback = asyncHandler(async (req, res) => {
  const { essay, rubric, subject, model } = req.body;
  const prompt = `Provide detailed feedback for this ${subject} assignment.
Rubric: ${rubric || 'Clarity, structure, factual accuracy, argument quality.'}
Essay: ${essay}`;
  const result = await completeWithOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt('teachers') },
      { role: 'user', content: prompt },
    ],
    model,
    metadata: toMetadata(req, 'assignment_feedback', prompt, subject, model),
  });
  res.json({ success: true, feedback: result.content, usage: result.usage });
});

export const summaryGenerator = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) throw new ApiError(400, 'PDF file is required');
  const { model } = req.body;
  const parsed = await pdfParse(req.file.buffer);
  const text = (parsed.text || '').trim();
  if (!text) throw new ApiError(400, 'Could not extract text from PDF');

  const truncated = text.slice(0, 12000);
  const prompt = `Summarize the following class notes into key points, formulas, and exam tips:\n\n${truncated}`;
  const result = await completeWithOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt('students') },
      { role: 'user', content: prompt },
    ],
    model,
    metadata: toMetadata(req, 'summary_generator', prompt, 'notes', model),
  });
  res.json({ success: true, summary: result.content, usage: result.usage });
});

export const quizGenerator = asyncHandler(async (req, res) => {
  const { topic, questionCount, difficulty, model } = req.body;
  const prompt = `Generate ${questionCount} ${difficulty} MCQs on "${topic}" with 4 options each and clearly marked answers.`;
  const result = await completeWithOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt('teachers') },
      { role: 'user', content: prompt },
    ],
    model,
    metadata: toMetadata(req, 'quiz_generator', prompt, topic, model),
  });
  res.json({ success: true, quiz: result.content, usage: result.usage });
});

export const attendanceInsights = asyncHandler(async (req, res) => {
  const { records, model } = req.body;
  const prompt = `Analyze this attendance series and give actionable interventions for student/parent/school:
${JSON.stringify(records)}`;
  const result = await completeWithOpenRouter({
    messages: [
      { role: 'system', content: systemPrompt('admins and teachers') },
      { role: 'user', content: prompt },
    ],
    model,
    metadata: toMetadata(req, 'attendance_insights', prompt, 'attendance', model),
  });
  res.json({ success: true, insights: result.content, usage: result.usage });
});
