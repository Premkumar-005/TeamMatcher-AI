import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const resumeDir = path.resolve('uploads', 'resumes');
const workspaceDir = path.resolve('uploads', 'workspace');

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}
if (!fs.existsSync(workspaceDir)) {
  fs.mkdirSync(workspaceDir, { recursive: true });
}

// Resume Storage Configuration (PDFs)
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeUserId = req.user?._id ? req.user._id.toString() : 'worker';
    cb(null, `resume-${safeUserId}-${Date.now()}${ext}`);
  }
});

// Resume File Filter (PDFs only)
const resumeFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF resumes are accepted.'), false);
  }
};

export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: resumeFileFilter
});

// Workspace File Storage
const workspaceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, workspaceDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `file-${Date.now()}-${sanitizedBase}${ext}`);
  }
});

// Workspace File Filter — allow common project file types
const workspaceFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, PNG, JPG, JPEG, TXT, ZIP`), false);
  }
};

export const uploadWorkspaceFile = multer({
  storage: workspaceStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter: workspaceFileFilter
});

export default {
  uploadResume,
  uploadWorkspaceFile
};
