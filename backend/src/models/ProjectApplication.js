import mongoose from 'mongoose';

const projectApplicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker reference is required']
    },
    coverMessage: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Cover message cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Prevent duplicate applications from the same worker to the same project
projectApplicationSchema.index({ project: 1, worker: 1 }, { unique: true });
projectApplicationSchema.index({ worker: 1, status: 1 });
projectApplicationSchema.index({ project: 1, status: 1 });

const ProjectApplication = mongoose.model('ProjectApplication', projectApplicationSchema);

export default ProjectApplication;
