export const initialActiveTeam = {
  id: 'team-cyberguard',
  name: 'CyberGuard Squad',
  project: 'AI Attendance System',
  overallScore: 96,
  successPrediction: 94,
  coverage: 100,
  members: [
    { id: 'user-logesh', name: 'Logesh (You)', role: 'Frontend Lead', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', status: 'Owner' },
    { id: 'user-arun', name: 'Arun Kumar', role: 'AI / ML Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Accepted' },
    { id: 'user-kavin', name: 'Kavin Raj', role: 'Backend Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', status: 'Accepted' },
    { id: 'user-sneha', name: 'Sneha Patel', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', status: 'Accepted' }
  ]
};

export const initialWorkspaceData = {
  tasks: [
    { id: 't1', title: 'Setup React + Vite Frontend Structure', status: 'Done', assignee: 'Logesh' },
    { id: 't2', title: 'Train OpenCV Anti-Spoofing Model', status: 'In Progress', assignee: 'Arun' },
    { id: 't3', title: 'Configure JWT Auth & Express APIs', status: 'In Progress', assignee: 'Kavin' },
    { id: 't4', title: 'Design Figma UI Components & System Tokens', status: 'To Do', assignee: 'Sneha' }
  ],
  messages: [
    { id: 1, sender: 'Arun Kumar', role: 'AI / ML Engineer', text: 'Hey team! Model training accuracy reached 98.4% on validation set.', time: '10:14 AM' },
    { id: 2, sender: 'Kavin Raj', role: 'Backend Specialist', text: 'Awesome! Express REST API endpoints for user authentication are live.', time: '10:18 AM' },
    { id: 3, sender: 'Logesh (You)', role: 'Frontend Lead', text: 'Great! Connecting the React dashboard components with the backend services now.', time: '10:22 AM' }
  ],
  files: [
    { name: 'AI_Attendance_Architecture.pdf', size: '4.2 MB', author: 'Arun Kumar', date: 'Today' },
    { name: 'dataset_face_embeddings.json', size: '18.5 MB', author: 'Arun Kumar', date: 'Yesterday' },
    { name: 'api_swagger_specs.json', size: '1.1 MB', author: 'Kavin Raj', date: '2 days ago' }
  ],
  meetings: [
    { title: 'Daily Architecture Standup', time: '04:00 PM Today', link: 'https://meet.google.com/abc-defg-hij' },
    { title: 'Sprint Review & Live Demo', time: '06:00 PM Tomorrow', link: 'https://meet.google.com/xyz-uvwx-rst' }
  ]
};
