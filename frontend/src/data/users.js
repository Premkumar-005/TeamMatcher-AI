export const currentUser = {
  id: 'user-logesh',
  name: 'Logesh',
  email: 'logesh@teammatcher.ai',
  title: 'Full Stack Engineer & AI Specialist',
  bio: 'Building intelligent web applications and AI-driven SaaS solutions. Passionate about system architecture, React, and machine learning.',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  resumeUploaded: true,
  resumeScore: 88,
  profileStrength: 92,
  projectReadiness: 92,
  teamCompatibility: 95,
  skillCoverage: 84,
  github: 'logesh-dev',
  linkedin: 'logesh-official',
  experienceLevel: 'Intermediate',
  skills: [
    { name: 'Java', level: 90, category: 'Languages' },
    { name: 'React', level: 82, category: 'Frameworks' },
    { name: 'Git', level: 80, category: 'Tools' },
    { name: 'Node.js', level: 76, category: 'Frameworks' },
    { name: 'MongoDB', level: 72, category: 'Databases' },
    { name: 'Python', level: 65, category: 'Languages' },
    { name: 'Express.js', level: 74, category: 'Frameworks' },
    { name: 'Tailwind CSS', level: 85, category: 'Frameworks' }
  ],
  extractedSkills: {
    languages: ['Java', 'Python', 'JavaScript', 'SQL', 'C++'],
    frameworks: ['React', 'Node.js', 'Express.js', 'Spring Boot', 'Tailwind CSS'],
    databases: ['MongoDB', 'PostgreSQL', 'Redis'],
    tools: ['Git', 'Docker', 'Postman', 'Vite'],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Agile Methodologies']
  },
  projects: [
    { name: 'Cloud Cost Optimizer', role: 'Full Stack Developer', tech: ['React', 'Node.js', 'AWS'] },
    { name: 'TeamMatcher Platform', role: 'Lead Frontend Engineer', tech: ['React', 'Vite', 'Tailwind'] }
  ],
  education: [
    { degree: 'B.Tech Computer Science & AI', institution: 'State University', year: '2022 - 2026', gpa: '3.9 / 4.0' }
  ],
  certifications: [
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2025' },
    { name: 'Oracle Certified Java SE 11 Developer', issuer: 'Oracle', date: '2024' }
  ]
};

export const mockCandidates = [
  {
    id: 'user-arun',
    name: 'Arun Kumar',
    role: 'AI / ML Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    compatibility: 96,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'FastAPI'],
    experience: '3 Years • ML Specialist',
    github: 'arunkumar-ai',
    linkedin: 'arunkumar-ml',
    matchReason: 'Complements your frontend skills with strong backend and AI/ML experience.',
    status: 'Available'
  },
  {
    id: 'user-kavin',
    name: 'Kavin Raj',
    role: 'Backend Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    compatibility: 91,
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Microservices'],
    experience: '3.5 Years • Senior Backend',
    github: 'kavinraj-backend',
    linkedin: 'kavin-raj-dev',
    matchReason: 'Provides robust Java & microservice architecture for scalable production APIs.',
    status: 'Available'
  },
  {
    id: 'user-priya',
    name: 'Priya Sharma',
    role: 'Full Stack & Database Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    compatibility: 89,
    skills: ['Node.js', 'Express', 'MongoDB', 'GraphQL', 'TypeScript'],
    experience: '2.5 Years • Full Stack Dev',
    github: 'priyasharma-dev',
    linkedin: 'priya-sharma-fullstack',
    matchReason: 'Fills backend database optimization & API endpoint integration gaps.',
    status: 'Available'
  },
  {
    id: 'user-sneha',
    name: 'Sneha Patel',
    role: 'UI/UX & Product Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    compatibility: 87,
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Tailwind'],
    experience: '2 Years • Lead Designer',
    github: 'snehapatel-design',
    linkedin: 'sneha-patel-ux',
    matchReason: 'Delivers high-fidelity minimalist product mockups and scalable design tokens.',
    status: 'Available'
  }
];
