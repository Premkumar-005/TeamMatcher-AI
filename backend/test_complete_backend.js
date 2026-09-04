import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const makeRequest = (options, postData = null, isMultipart = false, boundary = '') => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (isMultipart) {
        req.write(postData);
      } else {
        req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
      }
    }
    req.end();
  });
};

const runAllTests = async () => {
  console.log('========================================================');
  console.log('   TEAMMATCHER FINAL ARCHITECTURE VERIFICATION SUITE');
  console.log('========================================================\n');

  let ownerToken = '';
  let workerToken = '';
  let createdProjectId = '';
  let createdApplicationId = '';
  let createdTeamId = '';
  let worker2Token = '';

  // 1. Health Check
  console.log('1. Testing GET /api/health...');
  const health = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`   Status: ${health.status}, Message: "${health.data?.message}"`);
  if (health.status !== 200 || !health.data?.success) throw new Error('Health check failed');

  // 2. Role-based Registration (Invalid Role Rejection)
  console.log('\n2. Testing POST /api/auth/register (Invalid Role Rejection)...');
  const invalidRoleRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Hacker',
      email: `invalid.role.${Date.now()}@teammatcher.ai`,
      password: 'password123',
      role: 'ADMIN_SUPERUSER'
    }
  );
  console.log(`   Status: ${invalidRoleRes.status} (Expected 400), Message: "${invalidRoleRes.data?.message}"`);
  if (invalidRoleRes.status !== 400) throw new Error('Failed to reject invalid role');

  // 3. Valid Registration (OWNER)
  console.log('\n3. Testing POST /api/auth/register (Valid OWNER)...');
  const uniqueId = Date.now();
  const ownerEmail = `test.owner.${uniqueId}@teammatcher.ai`;
  const ownerReg = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Test Project Owner',
      email: ownerEmail,
      password: 'password123',
      role: 'OWNER',
      company: 'NextGen Tech Ventures',
      bio: 'Hiring top tier engineering squads.'
    }
  );
  console.log(`   Status: ${ownerReg.status}, Role: ${ownerReg.data?.data?.user?.role}, Token received: ${!!ownerReg.data?.data?.token}`);
  if (ownerReg.status !== 201 || ownerReg.data?.data?.user?.role !== 'OWNER') throw new Error('Owner registration failed');
  ownerToken = ownerReg.data.data.token;

  // 4. Valid Registration (WORKER)
  console.log('\n4. Testing POST /api/auth/register (Valid WORKER)...');
  const workerEmail = `test.worker.${uniqueId}@teammatcher.ai`;
  const workerReg = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Test Full Stack Worker',
      email: workerEmail,
      password: 'password123',
      role: 'WORKER',
      title: 'Full Stack Engineer',
      skills: [
        { name: 'React', proficiency: 90 },
        { name: 'Node.js', proficiency: 85 },
        { name: 'MongoDB', proficiency: 80 }
      ],
      experienceLevel: 'Intermediate',
      github: 'test-worker-gh'
    }
  );
  console.log(`   Status: ${workerReg.status}, Role: ${workerReg.data?.data?.user?.role}, Skills count: ${workerReg.data?.data?.user?.skills?.length}`);
  if (workerReg.status !== 201 || workerReg.data?.data?.user?.role !== 'WORKER') throw new Error('Worker registration failed');
  workerToken = workerReg.data.data.token;

  // Login a 2nd Worker for access control checks
  const worker2Email = `test.worker2.${uniqueId}@teammatcher.ai`;
  const worker2Reg = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Unrelated Worker',
      email: worker2Email,
      password: 'password123',
      role: 'WORKER',
      skills: [{ name: 'Python', proficiency: 80 }]
    }
  );
  worker2Token = worker2Reg.data.data.token;

  // 5. OWNER Creates a Project
  console.log('\n5. Testing POST /api/projects (OWNER creating project)...');
  const createProjRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    {
      title: 'Enterprise AI Knowledge Retrieval Engine',
      description: 'Building dense semantic indexing microservices with React frontends and MongoDB document storage.',
      category: 'AI & Enterprise Software',
      teamSize: 3,
      duration: 6,
      durationUnit: 'weeks',
      requiredSkills: [
        { name: 'React', requiredLevel: 80 },
        { name: 'Node.js', requiredLevel: 80 },
        { name: 'MongoDB', requiredLevel: 70 },
        { name: 'Python', requiredLevel: 75 }
      ]
    }
  );
  console.log(`   Status: ${createProjRes.status}, Created ID: ${createProjRes.data?.data?.project?._id}`);
  if (createProjRes.status !== 201) throw new Error('Failed to create project as Owner');
  createdProjectId = createProjRes.data.data.project._id;

  // 6. WORKER attempting to create a Project (Expecting 403 Forbidden)
  console.log('\n6. Testing POST /api/projects (WORKER attempt -> Expecting 403 Forbidden)...');
  const forbiddenProjRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    {
      title: 'Illegal Project Created by Worker',
      description: 'Workers are not permitted to create projects.',
      category: 'Web',
      teamSize: 2
    }
  );
  console.log(`   Status: ${forbiddenProjRes.status} (Expected 403), Message: "${forbiddenProjRes.data?.message}"`);
  if (forbiddenProjRes.status !== 403) throw new Error('Security violation: Worker was allowed to create a project!');

  // 7. WORKER Deterministic Project Compatibility Match
  console.log('\n7. Testing GET /api/projects/:projectId/match (Deterministic Skill Matching)...');
  const matchRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/projects/${createdProjectId}/match`,
    method: 'GET',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  console.log(`   Status: ${matchRes.status}, Match: ${matchRes.data?.data?.matchPercentage}%, Status: "${matchRes.data?.data?.qualificationStatus}"`);
  console.log(`   Matched: [${matchRes.data?.data?.matchingSkills?.join(', ')}], Missing: [${matchRes.data?.data?.missingSkills?.join(', ')}]`);
  if (matchRes.status !== 200 || matchRes.data?.data?.matchPercentage === undefined) throw new Error('Skill match endpoint failed');

  // 8. WORKER Recommended Projects
  console.log('\n8. Testing GET /api/projects/recommended (Worker Ranked Projects)...');
  const recRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/projects/recommended',
    method: 'GET',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  console.log(`   Status: ${recRes.status}, Projects Returned: ${recRes.data?.data?.length}`);
  if (recRes.status !== 200 || !Array.isArray(recRes.data?.data)) throw new Error('Recommended projects failed');

  // 9. WORKER Applies to Project
  console.log('\n9. Testing POST /api/projects/:projectId/apply (Worker Applying)...');
  const applyRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/projects/${createdProjectId}/apply`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { coverMessage: 'I would love to build the React and Node.js parts of this enterprise engine!' }
  );
  console.log(`   Status: ${applyRes.status}, Application Status: ${applyRes.data?.data?.application?.status}`);
  if (applyRes.status !== 201) throw new Error('Worker application failed');
  createdApplicationId = applyRes.data.data.application._id;

  // Duplicate Application Prevention
  console.log('\n10. Testing Duplicate Application Prevention...');
  const dupApplyRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/projects/${createdProjectId}/apply`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { coverMessage: 'Trying to apply twice' }
  );
  console.log(`   Status: ${dupApplyRes.status} (Expected 409), Message: "${dupApplyRes.data?.message}"`);
  if (dupApplyRes.status !== 409) throw new Error('Failed to reject duplicate application');

  // 11. OWNER Views Applications
  console.log('\n11. Testing GET /api/projects/:projectId/applications (Owner viewing applications)...');
  const viewAppsRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/projects/${createdProjectId}/applications`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  console.log(`   Status: ${viewAppsRes.status}, Applications Count: ${viewAppsRes.data?.data?.length}`);
  if (viewAppsRes.status !== 200 || viewAppsRes.data?.data?.length === 0) throw new Error('Owner view applications failed');

  // 12. WORKER attempting to accept application (Expecting 403 Forbidden)
  console.log('\n12. Testing PUT /api/applications/:id/accept (Worker attempt -> Expecting 403 Forbidden)...');
  const workerAcceptRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/applications/${createdApplicationId}/accept`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  console.log(`   Status: ${workerAcceptRes.status} (Expected 403), Message: "${workerAcceptRes.data?.message}"`);
  if (workerAcceptRes.status !== 403) throw new Error('Security violation: Worker accepted application');

  // 13. OWNER Accepts Application -> Automatic Team Creation & Skill Coverage Computation
  console.log('\n13. Testing PUT /api/applications/:id/accept (Owner accepting worker -> Auto Team Formation)...');
  const acceptRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/applications/${createdApplicationId}/accept`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    { role: 'Lead Frontend & Node Engineer' }
  );
  console.log(`   Status: ${acceptRes.status}, Application Status: ${acceptRes.data?.data?.application?.status}`);
  console.log(`   Team Auto-Created: "${acceptRes.data?.data?.team?.name}", Members: ${acceptRes.data?.data?.team?.members?.length}`);
  console.log(`   Team Skill Coverage: ${acceptRes.data?.data?.team?.skillCoverage?.percentage}%`);
  if (acceptRes.status !== 200 || !acceptRes.data?.data?.team) throw new Error('Owner accept application / team formation failed');
  createdTeamId = acceptRes.data.data.team._id;

  // 14. WORKER Views My Teams
  console.log('\n14. Testing GET /api/teams/my (Worker viewing assigned teams)...');
  const myTeamsRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/teams/my',
    method: 'GET',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  console.log(`   Status: ${myTeamsRes.status}, Teams Found: ${myTeamsRes.data?.data?.length}`);
  if (myTeamsRes.status !== 200 || myTeamsRes.data?.data?.length === 0) throw new Error('Worker my teams failed');

  // 15. Workspace Tasks: Owner creates task
  console.log('\n15. Testing POST /api/teams/:teamId/tasks (Owner creates task)...');
  const createTaskRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${createdTeamId}/tasks`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    {
      title: 'Initialize React Query & Tailwind Design Tokens',
      priority: 'High',
      status: 'To Do'
    }
  );
  console.log(`   Status: ${createTaskRes.status}, Task Created: "${createTaskRes.data?.data?.title}"`);
  if (createTaskRes.status !== 201) throw new Error('Create task failed');

  // 16. Workspace Chat: Member sends message
  console.log('\n16. Testing POST /api/teams/:teamId/messages (Member sending message)...');
  const sendMsgRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${createdTeamId}/messages`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { text: 'Starting on the Tailwind design tokens now. Will update task when PR is ready.' }
  );
  console.log(`   Status: ${sendMsgRes.status}, Message Created: "${sendMsgRes.data?.data?.text}"`);
  if (sendMsgRes.status !== 201) throw new Error('Send message failed');

  // 17. Workspace Access Control: Unrelated Worker attempt -> Expecting 403 Forbidden
  console.log('\n17. Testing GET /api/teams/:teamId (Unrelated Worker attempt -> Expecting 403 Forbidden)...');
  const unauthWorkspaceRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/teams/${createdTeamId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${worker2Token}` }
  });
  console.log(`   Status: ${unauthWorkspaceRes.status} (Expected 403), Message: "${unauthWorkspaceRes.data?.message}"`);
  if (unauthWorkspaceRes.status !== 403) throw new Error('Security violation: Unrelated worker accessed private workspace!');

  // 18. Notifications: Worker checks notifications
  console.log('\n18. Testing GET /api/notifications (Worker checking acceptance notification)...');
  const notifRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  console.log(`   Status: ${notifRes.status}, Notifications Count: ${notifRes.data?.data?.length}`);
  console.log(`   Latest Title: "${notifRes.data?.data?.[0]?.title}"`);
  if (notifRes.status !== 200 || notifRes.data?.data?.length === 0) throw new Error('Notifications failed');

  // 19. Worker Leaves Team
  console.log('\n19. Testing PUT /api/teams/:teamId/leave (Worker leaving team)...');
  const leaveRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/teams/${createdTeamId}/leave`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  console.log(`   Status: ${leaveRes.status}, Message: "${leaveRes.data?.message}"`);
  if (leaveRes.status !== 200) throw new Error('Worker leave team failed');

  // 20. Owner Closes Project
  console.log('\n20. Testing PUT /api/projects/:id/status (Owner closing project)...');
  const closeRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/projects/${createdProjectId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    { status: 'CLOSED' }
  );
  console.log(`   Status: ${closeRes.status}, Project Status: "${closeRes.data?.data?.project?.status}"`);
  if (closeRes.status !== 200 || closeRes.data?.data?.project?.status !== 'CLOSED') throw new Error('Owner close project failed');

  console.log('\n========================================================');
  console.log('  ✨ ALL 20 COMPREHENSIVE BACKEND TESTS PASSED! ✨');
  console.log('========================================================\n');
  process.exit(0);
};

runAllTests().catch((err) => {
  console.error('\n Test Suite Failed:', err);
  process.exit(1);
});
