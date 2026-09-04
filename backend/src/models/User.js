import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    }
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '', trim: true },
    institution: { type: String, default: '', trim: true },
    year: { type: String, default: '', trim: true },
    gpa: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const projectItemSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    role: { type: String, default: '', trim: true },
    tech: [{ type: String, trim: true }]
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    issuer: { type: String, default: '', trim: true },
    date: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      required: [true, 'Role is required. Must be OWNER or WORKER'],
      enum: {
        values: ['OWNER', 'WORKER'],
        message: 'Role must be either OWNER or WORKER'
      }
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    },
    bio: {
      type: String,
      default: '',
      trim: true
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    college: {
      type: String,
      default: '',
      trim: true
    },
    education: {
      type: [educationSchema],
      default: []
    },
    skills: {
      type: [skillSchema],
      default: []
    },
    interests: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0
    },
    github: {
      type: String,
      default: '',
      trim: true
    },
    linkedin: {
      type: String,
      default: '',
      trim: true
    },
    portfolio: {
      type: String,
      default: '',
      trim: true
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'NOT_AVAILABLE'],
      default: 'AVAILABLE'
    },
    availabilityStart: {
      type: Date,
      default: null
    },
    availabilityEnd: {
      type: Date,
      default: null
    },
    resume: {
      type: String,
      default: ''
    },
    resumeStatus: {
      type: String,
      enum: ['NOT_UPLOADED', 'UPLOADED', 'ANALYZING', 'ANALYZED'],
      default: 'NOT_UPLOADED'
    },
    resumeScore: {
      type: Number,
      default: 0
    },
    profileCompletion: {
      type: Number,
      default: 0
    },
    extractedSkills: {
      languages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      databases: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      softSkills: { type: [String], default: [] }
    },
    projects: {
      type: [projectItemSchema],
      default: []
    },
    certifications: {
      type: [certificationSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Match user-entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password if modified & ensure skills level/proficiency sync
userSchema.pre('save', async function (next) {
  if (this.skills && this.skills.length > 0) {
    this.skills = this.skills.map((s) => ({
      name: s.name,
      proficiency: s.proficiency !== undefined ? s.proficiency : s.level || 80,
      level: s.level !== undefined ? s.level : s.proficiency || 80,
      category: s.category || 'General'
    }));
  }

  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
