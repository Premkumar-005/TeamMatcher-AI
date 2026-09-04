import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      default: 'Team Member',
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'],
      default: 'To Do'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '0 KB'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team owner is required']
    },
    members: {
      type: [teamMemberSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['FORMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    teamSize: {
      type: Number,
      default: 4,
      min: 1
    },
    skillCoverage: {
      percentage: { type: Number, default: 0 },
      coveredSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] }
    },
    tasks: {
      type: [taskSchema],
      default: []
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    files: {
      type: [fileSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for fast lookup
teamSchema.index({ project: 1 });
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;
