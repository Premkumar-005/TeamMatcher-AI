import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Project from './src/models/Project.js';
import ProjectApplication from './src/models/ProjectApplication.js';
import Team from './src/models/Team.js';

dotenv.config();

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runCompleteUserFlowTest = async () => {
  console.log('================================================================');
  console.log('     TEAMMATCHER COMPLETE REAL FLOW & E2E VERIFICATION SUITE');
  console.log('================================================================\n');

  const uniqueId = Date.now();
  const workerEmail = `real.worker.${uniqueId}@teammatcher.ai`;
  const workerPassword = 'WorkerPassword123!';
  const workerName = `Worker ${uniqueId.toString().slice(-4)}`;

  const ownerEmail = `real.owner.${uniqueId}@teammatcher.ai`;
  const ownerPassword = 'OwnerPassword123!';
  const ownerName = `Owner ${uniqueId.toString().slice(-4)}`;

  const worker2Email = `real.worker2.${uniqueId}@teammatcher.ai`;
  const worker2Password = 'WorkerPassword123!';
  const worker2Name = `Worker2 ${uniqueId.toString().slice(-4)}`;

  let workerToken = '';
  let workerId = '';

  let ownerToken = '';
  let ownerId = '';

  let worker2Token = '';
  let worker2Id = '';

  let projectId = '';
  let project2Id = '';

  let applicationId = '';
  let application2Id = '';

  // 1. Create Worker account
  console.log('STEP 1: Create Worker account...');
  const regWorker = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: workerName,
      email: workerEmail,
      password: workerPassword,
      role: 'WORKER',
      title: 'Full Stack Engineer'
    }
  );
  console.log(`   Status: ${regWorker.status}, Success: ${regWorker.data.success}`);
  if (regWorker.status !== 201 || !regWorker.data.data?.token) throw new Error('Step 1 Failed');
  workerToken = regWorker.data.data.token;
  workerId = regWorker.data.data.user._id;

  // 2. Login as Worker
  console.log('\nSTEP 2: Login as Worker...');
  const loginWorker = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: workerEmail, password: workerPassword }
  );
  console.log(`   Status: ${loginWorker.status}, User ID: ${loginWorker.data.data?.user?._id}`);
  if (loginWorker.status !== 200) throw new Error('Step 2 Failed');

  // 3. Create/complete Worker profile
  console.log('\nSTEP 3: Create/complete Worker profile (skills & details)...');
  const updateProfile = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/me',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    {
      bio: 'Expert full stack engineer specializing in React and Node.js microservices.',
      github: 'real-worker-gh',
      linkedin: 'real-worker-in'
    }
  );
  const updateSkills = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/me/skills',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    {
      skills: [
        { name: 'React', proficiency: 90 },
        { name: 'Node.js', proficiency: 85 },
        { name: 'MongoDB', proficiency: 80 }
      ]
    }
  );
  console.log(`   Status: ${updateSkills.status}, Total Skills Saved in DB: ${updateSkills.data.data?.skills?.length}`);
  if (updateSkills.status !== 200) throw new Error('Step 3 Failed');

  // 4. Login as Owner (Register & Login Owner)
  console.log('\nSTEP 4: Create & Login as Owner account...');
  const regOwner = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: 'OWNER',
      company: 'Real Tech Solutions'
    }
  );
  console.log(`   Status: ${regOwner.status}, Role: ${regOwner.data.data?.user?.role}`);
  if (regOwner.status !== 201) throw new Error('Step 4 Failed');
  ownerToken = regOwner.data.data.token;
  ownerId = regOwner.data.data.user._id;

  // 5. Create a real project with required skills
  console.log('\nSTEP 5: Owner creates a real project with required skills...');
  const createProject = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    {
      title: `Real AI Cloud Engine ${uniqueId.toString().slice(-4)}`,
      description: 'Building dense cloud computing infrastructure with React and Node.js.',
      category: 'FinTech & Cloud Infrastructure',
      teamSize: 3,
      duration: 8,
      durationUnit: 'weeks',
      requiredSkills: [
        { name: 'React', requiredLevel: 80 },
        { name: 'Node.js', requiredLevel: 80 },
        { name: 'MongoDB', requiredLevel: 75 },
        { name: 'Tailwind CSS', requiredLevel: 80 },
        { name: 'Java', requiredLevel: 70 }
      ]
    }
  );
  console.log(`   Status: ${createProject.status}, Project ID: ${createProject.data.data?.project?._id}`);
  console.log(`   Required Skills Count Saved in DB: ${createProject.data.data?.project?.requiredSkills?.length}`);
  if (createProject.status !== 201 || createProject.data.data?.project?.requiredSkills?.length !== 5) throw new Error('Step 5 Failed');
  projectId = createProject.data.data.project._id;

  // 6. Login as Worker
  console.log('\nSTEP 6: Login as Worker again...');
  const loginWorkerAgain = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: workerEmail, password: workerPassword }
  );
  console.log(`   Status: ${loginWorkerAgain.status}, Token Verified: ${!!loginWorkerAgain.data.data?.token}`);
  if (loginWorkerAgain.status !== 200) throw new Error('Step 6 Failed');

  // 7. Find that project
  console.log('\nSTEP 7: Worker finds available projects...');
  const getProjects = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/projects',
    method: 'GET',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  const foundProject = getProjects.data.data?.find((p) => p._id === projectId);
  console.log(`   Status: ${getProjects.status}, Found Target Project: ${Boolean(foundProject)}, Match Score: ${foundProject?.matchPercentage}%`);
  if (!foundProject) throw new Error('Step 7 Failed: Project not found in catalog');

  // 8. Apply to the project
  console.log('\nSTEP 8: Worker applies to the project...');
  const applyProject = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${projectId}/apply`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { coverMessage: 'I have 5 years experience with React & Node.js and would love to build this cloud engine.' }
  );
  console.log(`   Status: ${applyProject.status}, Initial Application Status: "${applyProject.data.data?.application?.status}"`);
  if (applyProject.status !== 201 || applyProject.data.data?.application?.status !== 'PENDING') throw new Error('Step 8 Failed');
  applicationId = applyProject.data.data.application._id;

  // 9. Login as Owner
  console.log('\nSTEP 9: Login as Owner...');
  const loginOwnerAgain = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: ownerEmail, password: ownerPassword }
  );
  console.log(`   Status: ${loginOwnerAgain.status}, Owner Logged In Successfully`);
  if (loginOwnerAgain.status !== 200) throw new Error('Step 9 Failed');

  // 10. Open that project
  console.log('\nSTEP 10: Owner opens that project details (GET /api/projects/:id)...');
  const getProjDetails = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/projects/${projectId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  console.log(`   Status: ${getProjDetails.status}, Project Title: "${getProjDetails.data.data?.project?.title}"`);
  if (getProjDetails.status !== 200) throw new Error('Step 10 Failed');

  // 11 & 12. Review Applicants & Verify real worker appears with PENDING status
  console.log('\nSTEP 11 & 12: Review Applicants for THIS specific project & verify PENDING status...');
  const getProjectApps = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/projects/${projectId}/applications`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const targetApp = getProjectApps.data.data?.find((a) => a._id === applicationId);
  console.log(`   Status: ${getProjectApps.status}, Count for Project: ${getProjectApps.data.data?.length}`);
  console.log(`   Applicant Name: "${targetApp?.worker?.name}"`);
  console.log(`   Applicant Skills: [${targetApp?.worker?.skills?.map((s) => s.name).join(', ')}]`);
  console.log(`   Application Message: "${targetApp?.coverMessage}"`);
  console.log(`   Application Status: "${targetApp?.status}"`);
  if (getProjectApps.status !== 200 || !targetApp || targetApp.status !== 'PENDING' || targetApp.worker?.name !== workerName) {
    throw new Error('Step 11/12 Failed');
  }

  // 13 & 14. Click Accept & Verify status becomes ACCEPTED
  console.log('\nSTEP 13 & 14: Owner clicks Accept & verify status becomes ACCEPTED...');
  const acceptApp = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/applications/${applicationId}/accept`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    { role: 'Lead Full Stack Engineer' }
  );
  console.log(`   Status: ${acceptApp.status}, Updated Application Status: "${acceptApp.data.data?.application?.status}"`);
  if (acceptApp.status !== 200 || acceptApp.data.data?.application?.status !== 'ACCEPTED') {
    throw new Error('Step 13/14 Failed');
  }

  // 15, 16 & 17. Verify worker becomes team member & Team Workspace shows REAL team members
  console.log('\nSTEP 15, 16 & 17: Verify worker becomes team member in DB & appears in Team Workspace...');
  const getMyTeams = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/teams/my',
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const createdTeam = getMyTeams.data.data?.[0];
  console.log(`   Teams Count: ${getMyTeams.data.data?.length}, Team Name: "${createdTeam?.name}"`);

  const teamId = createdTeam._id;
  const getTeamDetails = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/teams/${teamId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const memberList = getTeamDetails.data.data?.team?.members || [];
  const isWorkerInTeam = memberList.some((m) => m.user?._id === workerId || m.user === workerId);
  console.log(`   Team Workspace Members Count: ${memberList.length}`);
  console.log(`   Real Worker ("${workerName}") Present in Team: ${isWorkerInTeam}`);
  if (!isWorkerInTeam) throw new Error('Step 15/16/17 Failed: Worker not found in team members');

  // ==================== TEST REJECT FLOW ====================
  console.log('\n================================================================');
  console.log('                    TESTING REJECT FLOW');
  console.log('================================================================\n');

  // Register Worker 2
  console.log('Worker 2 Registers & Applies...');
  const regWorker2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: worker2Name,
      email: worker2Email,
      password: worker2Password,
      role: 'WORKER',
      title: 'Junior QA Engineer'
    }
  );
  worker2Token = regWorker2.data.data.token;
  worker2Id = regWorker2.data.data.user._id;

  const applyWorker2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${projectId}/apply`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${worker2Token}`
      }
    },
    { coverMessage: 'Applying for QA role.' }
  );
  application2Id = applyWorker2.data.data.application._id;
  console.log(`   Worker 2 Application Submitted (ID: ${application2Id}), Status: "${applyWorker2.data.data.application.status}"`);

  // Owner Rejects Worker 2
  console.log('Owner Clicks Reject on Worker 2...');
  const rejectApp = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/applications/${application2Id}/reject`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  console.log(`   Reject Status: ${rejectApp.status}, Application Status: "${rejectApp.data.data?.application?.status}"`);
  if (rejectApp.status !== 200 || rejectApp.data.data?.application?.status !== 'REJECTED') {
    throw new Error('Reject Flow Failed');
  }

  // Verify Worker 2 is NOT in Team
  const getTeamAfterReject = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/teams/${teamId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const updatedMembers = getTeamAfterReject.data.data?.team?.members || [];
  const isWorker2InTeam = updatedMembers.some((m) => m.user?._id === worker2Id || m.user === worker2Id);
  console.log(`   Worker 2 In Team: ${isWorker2InTeam} (Expected: false)`);
  if (isWorker2InTeam) throw new Error('Reject Verification Failed: Rejected worker was added to team!');

  // ==================== TEST PROJECT FILTERING ====================
  console.log('\n================================================================');
  console.log('              TESTING PROJECT FILTERING');
  console.log('================================================================\n');

  console.log('Owner Creates Second Project...');
  const createProject2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    {
      title: `Project Two ${uniqueId.toString().slice(-4)}`,
      description: 'Second separate project for testing filter isolation.',
      category: 'Healthcare & SaaS',
      teamSize: 2
    }
  );
  project2Id = createProject2.data.data.project._id;

  const proj1Apps = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/projects/${projectId}/applications`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });

  const proj2Apps = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/projects/${project2Id}/applications`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });

  console.log(`   Applications for Project 1: ${proj1Apps.data.data?.length}`);
  console.log(`   Applications for Project 2: ${proj2Apps.data.data?.length}`);
  const hasCrossContamination = proj2Apps.data.data?.some((a) => a.project === projectId || a._id === applicationId);
  console.log(`   Project 2 Has Project 1 Applications: ${hasCrossContamination} (Expected: false)`);
  if (hasCrossContamination) throw new Error('Project Filtering Failed: Applications leaked across projects!');

  // ==================== MONGODB DIRECT DB INSPECTION ====================
  console.log('\n================================================================');
  console.log('               DIRECT MONGODB DATABASE INSPECTION');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teammatcher');

  const dbWorker = await User.findById(workerId);
  console.log(`MongoDB User Document: ID=${dbWorker._id}, Name="${dbWorker.name}", Role="${dbWorker.role}", Skills=[${dbWorker.skills.map((s)=>s.name).join(', ')}]`);

  const dbProject = await Project.findById(projectId);
  console.log(`MongoDB Project Document: ID=${dbProject._id}, Title="${dbProject.title}", Owner=${dbProject.owner}`);

  const dbApp1 = await ProjectApplication.findById(applicationId);
  console.log(`MongoDB Application 1 Document: ID=${dbApp1._id}, Status="${dbApp1.status}", Worker=${dbApp1.worker}, Project=${dbApp1.project}`);

  const dbApp2 = await ProjectApplication.findById(application2Id);
  console.log(`MongoDB Application 2 Document: ID=${dbApp2._id}, Status="${dbApp2.status}", Worker=${dbApp2.worker}, Project=${dbApp2.project}`);

  const dbTeam = await Team.findById(teamId);
  console.log(`MongoDB Team Document: ID=${dbTeam._id}, Name="${dbTeam.name}", Members Count=${dbTeam.members.length}`);

  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log('  ✨ ALL REAL USER FLOWS, ACCEPT, REJECT & FILTERING PASSED! ✨');
  console.log('================================================================\n');
  process.exit(0);
};

runCompleteUserFlowTest().catch((err) => {
  console.error('\n❌ REAL USER FLOW TEST FAILED:', err);
  process.exit(1);
});
