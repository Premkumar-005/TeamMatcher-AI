import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectApplication from '../models/ProjectApplication.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import calculateProfileCompletion from '../utils/calculateProfileCompletion.js';
import { calculateTeamSkillCoverage } from '../services/matchingService.js';

dotenv.config({ path: path.resolve('.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teammatcher';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectApplication.deleteMany({});
    await Team.deleteMany({});
    await Notification.deleteMany({});

    console.log('--- SEEDING USERS ---');

    // 1. OWNER ACCOUNTS
    const owner1Data = {
      name: 'Alex Rivera',
      email: 'owner.alex@teammatcher.ai',
      password: 'password123',
      role: 'OWNER',
      title: 'Founder & CEO',
      company: 'CloudScale AI Labs',
      bio: 'Serial entrepreneur building next-gen AI developer tools and real-time vision systems.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      linkedin: 'alex-rivera-tech',
      portfolio: 'https://cloudscale.ai'
    };
    owner1Data.profileCompletion = calculateProfileCompletion(owner1Data);
    const owner1 = await User.create(owner1Data);

    const owner2Data = {
      name: 'Sarah Jenkins',
      email: 'owner.sarah@teammatcher.ai',
      password: 'password123',
      role: 'OWNER',
      title: 'VP of Engineering',
      company: 'MedAI Health Innovations',
      bio: 'Leading digital health infrastructure and HIPAA-compliant patient intelligence platforms.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      linkedin: 'sarah-jenkins-medtech',
      portfolio: 'https://medaihealth.io'
    };
    owner2Data.profileCompletion = calculateProfileCompletion(owner2Data);
    const owner2 = await User.create(owner2Data);

    console.log(`Created 2 Owners: ${owner1.email}, ${owner2.email}`);

    // 2. WORKER ACCOUNTS
    const workerLogeshData = {
      name: 'Logesh Subramanian',
      email: 'logeshsubramanian12@gmail.com',
      password: 'password123',
      role: 'WORKER',
      title: 'Lead Full Stack & MERN Engineer',
      college: 'State Technical University',
      education: [{ degree: 'B.Tech Computer Science & AI', institution: 'State Technical University', year: '2025' }],
      bio: 'Passionate about modern React interfaces, high-performance Express APIs, MongoDB architecture, and AI integrations.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      experienceLevel: 'Advanced',
      experienceYears: 3,
      skills: [
        { name: 'React', proficiency: 95, level: 95, category: 'Frontend' },
        { name: 'Node.js', proficiency: 92, level: 92, category: 'Backend' },
        { name: 'MongoDB', proficiency: 90, level: 90, category: 'Database' },
        { name: 'Express.js', proficiency: 88, level: 88, category: 'Backend' },
        { name: 'Tailwind CSS', proficiency: 94, level: 94, category: 'Styling' },
        { name: 'Python', proficiency: 82, level: 82, category: 'AI/ML' }
      ],
      interests: ['Full Stack Development', 'AI Systems', 'Cloud Scalability'],
      github: 'Logeshwaran502',
      linkedin: 'logesh-subramanian',
      portfolio: 'https://logesh.dev',
      availability: 'AVAILABLE'
    };
    workerLogeshData.profileCompletion = calculateProfileCompletion(workerLogeshData);
    const workerLogesh = await User.create(workerLogeshData);

    const workerPriyaData = {
      name: 'Priya Sharma',
      email: 'worker.priya@teammatcher.ai',
      password: 'password123',
      role: 'WORKER',
      title: 'Frontend UI/UX Specialist',
      college: 'National Institute of Design & Tech',
      education: [{ degree: 'B.Des & Interactive Computing', institution: 'NIDT', year: '2024' }],
      bio: 'Crafting pixel-perfect React design systems, micro-interactions, and accessible web experiences.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      experienceLevel: 'Advanced',
      experienceYears: 4,
      skills: [
        { name: 'React', proficiency: 96, level: 96, category: 'Frontend' },
        { name: 'TypeScript', proficiency: 90, level: 90, category: 'Frontend' },
        { name: 'Tailwind CSS', proficiency: 95, level: 95, category: 'Styling' },
        { name: 'Figma', proficiency: 92, level: 92, category: 'Design' },
        { name: 'Next.js', proficiency: 88, level: 88, category: 'Frontend' }
      ],
      interests: ['UI Systems', 'Web Performance', 'Design Engineering'],
      github: 'priya-frontend',
      linkedin: 'priya-sharma-ui',
      availability: 'AVAILABLE'
    };
    workerPriyaData.profileCompletion = calculateProfileCompletion(workerPriyaData);
    const workerPriya = await User.create(workerPriyaData);

    const workerKavinData = {
      name: 'Kavin Raj',
      email: 'worker.kavin@teammatcher.ai',
      password: 'password123',
      role: 'WORKER',
      title: 'Senior Backend & Database Architect',
      college: 'Metropolitan Engineering College',
      education: [{ degree: 'M.S. Software Systems', institution: 'MEC', year: '2023' }],
      bio: 'Specialized in microservices, distributed caching, PostgreSQL schema optimization, and Docker orchestration.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      experienceLevel: 'Advanced',
      experienceYears: 5,
      skills: [
        { name: 'Node.js', proficiency: 94, level: 94, category: 'Backend' },
        { name: 'Express.js', proficiency: 92, level: 92, category: 'Backend' },
        { name: 'MongoDB', proficiency: 90, level: 90, category: 'Database' },
        { name: 'PostgreSQL', proficiency: 88, level: 88, category: 'Database' },
        { name: 'Docker', proficiency: 85, level: 85, category: 'DevOps' }
      ],
      interests: ['Distributed Systems', 'API Performance', 'Cloud DBs'],
      github: 'kavin-backend',
      linkedin: 'kavin-raj-dev',
      availability: 'AVAILABLE'
    };
    workerKavinData.profileCompletion = calculateProfileCompletion(workerKavinData);
    const workerKavin = await User.create(workerKavinData);

    const workerArunData = {
      name: 'Arun Kumar',
      email: 'worker.arun@teammatcher.ai',
      password: 'password123',
      role: 'WORKER',
      title: 'AI / Machine Learning Engineer',
      college: 'AI & Data Science Academy',
      education: [{ degree: 'B.Tech AI & Data Science', institution: 'AIDSA', year: '2024' }],
      bio: 'Building computer vision pipelines, PyTorch models, OpenCV tracking, and FastAPI microservices.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      experienceLevel: 'Intermediate',
      experienceYears: 2,
      skills: [
        { name: 'Python', proficiency: 94, level: 94, category: 'AI/ML' },
        { name: 'FastAPI', proficiency: 90, level: 90, category: 'Backend' },
        { name: 'OpenCV', proficiency: 88, level: 88, category: 'AI/ML' },
        { name: 'TensorFlow', proficiency: 84, level: 84, category: 'AI/ML' },
        { name: 'PyTorch', proficiency: 82, level: 82, category: 'AI/ML' }
      ],
      interests: ['Deep Learning', 'Computer Vision', 'MLOps'],
      github: 'arun-ml-engineer',
      linkedin: 'arun-kumar-ai',
      availability: 'AVAILABLE'
    };
    workerArunData.profileCompletion = calculateProfileCompletion(workerArunData);
    const workerArun = await User.create(workerArunData);

    const workerElenaData = {
      name: 'Elena Rostova',
      email: 'worker.elena@teammatcher.ai',
      password: 'password123',
      role: 'WORKER',
      title: 'Lead Product & UI/UX Designer',
      college: 'Institute of Contemporary Design',
      bio: 'Transforming complex technical requirements into intuitive, modern SaaS interfaces and high-fidelity wireframes.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      experienceLevel: 'Expert',
      experienceYears: 6,
      skills: [
        { name: 'Figma', proficiency: 98, level: 98, category: 'Design' },
        { name: 'UI/UX Design', proficiency: 95, level: 95, category: 'Design' },
        { name: 'User Research', proficiency: 90, level: 90, category: 'Design' },
        { name: 'Design Systems', proficiency: 92, level: 92, category: 'Design' },
        { name: 'Tailwind CSS', proficiency: 80, level: 80, category: 'Styling' }
      ],
      interests: ['Product Design', 'Accessibility', 'Motion Design'],
      github: 'elena-ux',
      linkedin: 'elena-rostova-design',
      availability: 'AVAILABLE'
    };
    workerElenaData.profileCompletion = calculateProfileCompletion(workerElenaData);
    const workerElena = await User.create(workerElenaData);

    const workerMarcusData = {
      name: 'Marcus Vance',
      email: 'worker.marcus@teammatcher.ai',
      password: 'password123',
      role: 'WORKER',
      title: 'Cloud DevOps & Security Specialist',
      college: 'Global Tech Institute',
      bio: 'Automating multi-cloud deployments with Docker, Kubernetes, AWS CDK, and zero-trust security postures.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      experienceLevel: 'Advanced',
      experienceYears: 4,
      skills: [
        { name: 'Docker', proficiency: 94, level: 94, category: 'DevOps' },
        { name: 'AWS', proficiency: 90, level: 90, category: 'Cloud' },
        { name: 'Kubernetes', proficiency: 85, level: 85, category: 'DevOps' },
        { name: 'CI/CD', proficiency: 88, level: 88, category: 'DevOps' },
        { name: 'Linux', proficiency: 90, level: 90, category: 'DevOps' }
      ],
      interests: ['Infrastructure as Code', 'Security', 'Edge Computing'],
      github: 'marcus-devops',
      linkedin: 'marcus-vance-cloud',
      availability: 'AVAILABLE'
    };
    workerMarcusData.profileCompletion = calculateProfileCompletion(workerMarcusData);
    const workerMarcus = await User.create(workerMarcusData);

    console.log('Created 6 diverse Workers with verified skill metrics.');

    // 3. PROJECTS CREATED BY OWNERS
    console.log('\n--- SEEDING OWNER PROJECTS ---');

    const project1 = await Project.create({
      title: 'AI Facial Recognition & Attendance Engine',
      description: 'Building an enterprise-grade face recognition attendance system featuring real-time stream analysis, anti-spoofing detection, automated shift logs, and an administrative React dashboard.',
      owner: owner1._id,
      category: 'Computer Vision & AI',
      requiredSkills: [
        { name: 'Python', requiredLevel: 80, category: 'AI/ML' },
        { name: 'FastAPI', requiredLevel: 75, category: 'Backend' },
        { name: 'OpenCV', requiredLevel: 75, category: 'AI/ML' },
        { name: 'React', requiredLevel: 75, category: 'Frontend' }
      ],
      preferredExperienceLevel: 'Intermediate',
      minimumExperience: 2,
      teamSize: 3,
      duration: 6,
      durationUnit: 'weeks',
      location: 'Remote',
      workMode: 'Remote',
      budget: { amount: 3500, currency: 'USD', type: 'Fixed' },
      recommendedRoles: ['AI / Computer Vision Engineer', 'FastAPI Backend Lead', 'Frontend React Developer'],
      status: 'OPEN'
    });

    const project2 = await Project.create({
      title: 'Decentralized Micro-Lending Portal',
      description: 'Modern financial workspace enabling community micro-loans with automated KYC validation, smart contracts settlement simulation, instant wallet funding, and interactive repayment dashboards.',
      owner: owner1._id,
      category: 'FinTech & Cloud Infrastructure',
      requiredSkills: [
        { name: 'React', requiredLevel: 80, category: 'Frontend' },
        { name: 'Node.js', requiredLevel: 80, category: 'Backend' },
        { name: 'MongoDB', requiredLevel: 75, category: 'Database' },
        { name: 'Tailwind CSS', requiredLevel: 70, category: 'Styling' }
      ],
      preferredExperienceLevel: 'Advanced',
      minimumExperience: 2,
      teamSize: 4,
      duration: 8,
      durationUnit: 'weeks',
      location: 'Remote',
      workMode: 'Remote',
      budget: { amount: 5000, currency: 'USD', type: 'Fixed' },
      recommendedRoles: ['Full Stack Team Lead', 'Frontend UI Engineer', 'Database Specialist', 'Security Reviewer'],
      status: 'OPEN'
    });

    const project3 = await Project.create({
      title: 'HIPAA-Compliant Clinical Telehealth Platform',
      description: 'Real-time telemedicine consultation platform incorporating end-to-end encrypted WebRTC video, automated EHR transcription, audit logs, and PostgreSQL relational patient health records.',
      owner: owner2._id,
      category: 'Healthcare & SaaS',
      requiredSkills: [
        { name: 'Node.js', requiredLevel: 85, category: 'Backend' },
        { name: 'PostgreSQL', requiredLevel: 80, category: 'Database' },
        { name: 'Docker', requiredLevel: 75, category: 'DevOps' },
        { name: 'React', requiredLevel: 75, category: 'Frontend' }
      ],
      preferredExperienceLevel: 'Advanced',
      minimumExperience: 3,
      teamSize: 4,
      duration: 12,
      durationUnit: 'weeks',
      location: 'Hybrid',
      workMode: 'Hybrid',
      budget: { amount: 8000, currency: 'USD', type: 'Fixed' },
      recommendedRoles: ['Backend Security Lead', 'Relational DB Architect', 'DevOps Specialist', 'Frontend Engineer'],
      status: 'OPEN'
    });

    const project4 = await Project.create({
      title: 'Next-Gen Developer Analytics Suite',
      description: 'High-performance SaaS analytics suite providing code velocity metrics, PR cycle time insights, automated GitHub integrations, and interactive dark-themed charts.',
      owner: owner2._id,
      category: 'Developer Tools & SaaS',
      requiredSkills: [
        { name: 'React', requiredLevel: 90, category: 'Frontend' },
        { name: 'TypeScript', requiredLevel: 85, category: 'Frontend' },
        { name: 'Tailwind CSS', requiredLevel: 80, category: 'Styling' },
        { name: 'Figma', requiredLevel: 75, category: 'Design' }
      ],
      preferredExperienceLevel: 'Intermediate',
      minimumExperience: 1,
      teamSize: 3,
      duration: 4,
      durationUnit: 'weeks',
      location: 'Remote',
      workMode: 'Remote',
      budget: { amount: 2800, currency: 'USD', type: 'Fixed' },
      recommendedRoles: ['Lead Frontend Architect', 'UI/UX Design Lead', 'Data Visualizations Specialist'],
      status: 'OPEN'
    });

    console.log(`Created 4 Projects across 2 Owners.`);

    // 4. APPLICATIONS
    console.log('\n--- SEEDING APPLICATIONS ---');

    // Worker Logesh applied to Project 2 (Accepted)
    const app1 = await ProjectApplication.create({
      project: project2._id,
      worker: workerLogesh._id,
      coverMessage: 'I have extensive experience building full-stack MERN portals and real-time dashboard systems.',
      status: 'ACCEPTED',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // Worker Priya applied to Project 2 (Accepted)
    const app2 = await ProjectApplication.create({
      project: project2._id,
      worker: workerPriya._id,
      coverMessage: 'Excited to lead the React UI and responsive Tailwind interface design for this FinTech project.',
      status: 'ACCEPTED',
      appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    // Worker Arun applied to Project 1 (Accepted)
    const app3 = await ProjectApplication.create({
      project: project1._id,
      worker: workerArun._id,
      coverMessage: 'My core specialization is OpenCV stream processing, face alignment, and FastAPI microservices.',
      status: 'ACCEPTED',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // Worker Kavin applied to Project 3 (Pending review)
    const app4 = await ProjectApplication.create({
      project: project3._id,
      worker: workerKavin._id,
      coverMessage: 'Experienced with HIPAA compliance requirements, PostgreSQL schema migrations, and secure API gateways.',
      status: 'PENDING',
      appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    });

    // Worker Elena applied to Project 4 (Pending review)
    const app5 = await ProjectApplication.create({
      project: project4._id,
      worker: workerElena._id,
      coverMessage: 'Ready to build high-converting design systems and dark-mode data analytics charts in Figma & Tailwind.',
      status: 'PENDING',
      appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    });

    console.log('Created 5 Project Applications (3 Accepted, 2 Pending).');

    // 5. TEAMS CREATED BY OWNERS
    console.log('\n--- SEEDING TEAMS & WORKSPACE ---');

    // Team for Project 2 (Decentralized FinTech Portal)
    const teamMembersP2 = [
      {
        user: workerLogesh._id,
        role: 'Lead Full Stack Engineer',
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: workerPriya._id,
        role: 'Frontend UI Lead',
        joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const team2Coverage = calculateTeamSkillCoverage(
      [{ user: workerLogesh }, { user: workerPriya }],
      project2.requiredSkills
    );

    const team2 = await Team.create({
      name: 'FinTech Core Sprint Team',
      project: project2._id,
      owner: owner1._id,
      teamSize: 4,
      members: teamMembersP2,
      status: 'ACTIVE',
      skillCoverage: team2Coverage,
      tasks: [
        {
          title: 'Implement KYC verification UI & State',
          description: 'Build responsive document upload step with validation feedback in React.',
          status: 'In Progress',
          priority: 'High',
          assignee: workerPriya._id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Design MongoDB Loan Application Schemas',
          description: 'Define indexes, repayment schedules, and state transition validation.',
          status: 'Done',
          priority: 'Urgent',
          assignee: workerLogesh._id,
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          title: 'Integrate Express JWT Auth & Role Middleware',
          description: 'Protect all borrower and lender API routes with role checks.',
          status: 'Done',
          priority: 'High',
          assignee: workerLogesh._id,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      messages: [
        {
          sender: owner1._id,
          text: 'Welcome team! Kickoff sprint starts today. Let us focus on the KYC pipeline first.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          sender: workerLogesh._id,
          text: 'Backend schema and JWT auth are ready. Working on loan calculation endpoints now.',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
        },
        {
          sender: workerPriya._id,
          text: 'Frontend components for the KYC wizard are 80% done. Connecting to Logesh API today.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ],
      files: [
        {
          name: 'FinTech_System_Architecture_v1.pdf',
          url: '/uploads/workspace/architecture.pdf',
          size: '2.4 MB',
          uploadedBy: owner1._id,
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'API_Contract_Specification.json',
          url: '/uploads/workspace/api-spec.json',
          size: '48 KB',
          uploadedBy: workerLogesh._id,
          uploadedAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
        }
      ]
    });

    console.log(`Created Team for Project 2: "${team2.name}" with tasks, chat, and files.`);

    // 6. NOTIFICATIONS
    await Notification.create({
      recipient: workerLogesh._id,
      sender: owner1._id,
      type: 'APPLICATION_ACCEPTED',
      title: 'Application Accepted! 🎉',
      message: 'You have been accepted to join the Decentralized Micro-Lending Portal team.',
      link: '/teams'
    });

    await Notification.create({
      recipient: owner2._id,
      sender: workerKavin._id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application Received',
      message: 'Kavin Raj applied for HIPAA-Compliant Clinical Telehealth Platform',
      link: '/requests'
    });

    console.log('\n========================================================');
    console.log(' ✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨');
    console.log('========================================================\n');
    console.log('DEMO ACCOUNTS READY:');
    console.log('1. OWNER 1:  owner.alex@teammatcher.ai     (password: password123)');
    console.log('2. OWNER 2:  owner.sarah@teammatcher.ai    (password: password123)');
    console.log('3. WORKER 1: logeshsubramanian12@gmail.com (password: password123)');
    console.log('4. WORKER 2: worker.priya@teammatcher.ai   (password: password123)');
    console.log('5. WORKER 3: worker.kavin@teammatcher.ai   (password: password123)');
    console.log('6. WORKER 4: worker.arun@teammatcher.ai    (password: password123)');
    console.log('7. WORKER 5: worker.elena@teammatcher.ai   (password: password123)');
    console.log('8. WORKER 6: worker.marcus@teammatcher.ai  (password: password123)\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
