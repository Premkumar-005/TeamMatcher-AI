import mongoose from 'mongoose';

const requiredSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    requiredLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 70
    },
    category: {
      type: String,
      default: 'Technical',
      trim: true
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [160, 'Project title cannot exceed 160 characters']
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required']
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      trim: true
    },
    requiredSkills: {
      type: [requiredSkillSchema],
      default: []
    },
    preferredExperienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    minimumExperience: {
      type: Number,
      default: 1,
      min: 0
    },
    teamSize: {
      type: Number,
      required: [true, 'Team size is required'],
      min: [1, 'Team size must be at least 1 member'],
      default: 4
    },
    duration: {
      type: Number,
      default: 4,
      min: 1
    },
    durationUnit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'weeks'
    },
    startDate: {
      type: Date,
      default: null
    },
    applicationDeadline: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote'
    },
    budget: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      type: { type: String, enum: ['Fixed', 'Hourly', 'Stipend', 'Volunteer/Portfolio'], default: 'Fixed' }
    },
    recommendedRoles: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'],
      default: 'OPEN'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for applications count
projectSchema.virtual('applicationsCount', {
  ref: 'ProjectApplication',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Index for fast searching and filtering
projectSchema.index({ title: 'text', description: 'text', category: 1 });
projectSchema.index({ status: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
