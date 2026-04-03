import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    feature: {
      type: String,
      required: true,
      enum: [
        'doubt_solver',
        'study_planner',
        'grade_predictor',
        'assignment_feedback',
        'summary_generator',
        'quiz_generator',
        'attendance_insights',
      ],
      index: true,
    },
    subject: { type: String, trim: true, maxlength: 100 },
    model: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    usage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
  },
  { timestamps: true, versionKey: false }
);

aiInteractionSchema.index({ userId: 1, feature: 1, createdAt: -1 });

export const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);
