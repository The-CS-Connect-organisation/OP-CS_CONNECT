import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    path: String,
    method: String,
    statusCode: Number,
    message: String,
    stack: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: false }
);

errorLogSchema.index({ createdAt: -1, statusCode: 1 });

export const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);
