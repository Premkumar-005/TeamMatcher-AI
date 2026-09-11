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

const runKanbanE2ETest = async () => {
  console.log('================================================================');
  console.log('       KANBAN TASKS END-TO-END WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const ownerEmail = `kanban.owner.${timestamp}@teammatcher.ai`;
  const ownerPassword = 'OwnerPass123!';
  const workerEmail = `kanban.worker.${timestamp}@teammatcher.ai`;
  const workerPassword = 'WorkerPass123!';
  const outsiderEmail = `kanban.outsider.${timestamp}@teammatcher.ai`;
  const outsiderPassword = 'OutsiderPass123!';

  let ownerToken, ownerId;
  let workerToken, workerId;
  let outsiderToken, outsiderId;
  let projectId, teamId, taskId;

  // 1. Register Owner
  console.log('1. Registering Owner...');
  const ownerReg = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Kanban Owner',
      email: ownerEmail,
      password: ownerPassword,
      role: 'OWNER',
      company: 'Kanban Dev Corp'
    }
  );
  if (ownerReg.status !== 201) throw new Error(`Owner registration failed: ${JSON.stringify(ownerReg.data)}`);
  ownerToken = ownerReg.data.data.token;
  ownerId = ownerReg.data.data.user._id;
  console.log(`   Owner registered: ID ${ownerId}`);

  // 2. Register Worker
  console.log('\n2. Registering Worker...');
  const workerReg = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Kanban Worker',
      email: workerEmail,
      password: workerPassword,
      role: 'WORKER',
      title: 'Fullstack Dev'
    }
  );
  if (workerReg.status !== 201) throw new Error(`Worker registration failed: ${JSON.stringify(workerReg.data)}`);
  workerToken = workerReg.data.data.token;
  workerId = workerReg.data.data.user._id;
  console.log(`   Worker registered: ID ${workerId}`);

  // 3. Register Outsider User (not part of team)
  console.log('\n3. Registering Outsider User...');
  const outsiderReg = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Kanban Outsider',
      email: outsiderEmail,
      password: outsiderPassword,
      role: 'WORKER'
    }
  );
  outsiderToken = outsiderReg.data.data.token;
  outsiderId = outsiderReg.data.data.user._id;

  // 4. Owner Creates Project
  console.log('\n4. Owner Creating Project...');
  const projectRes = await makeRequest(
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
      title: `Kanban Sprint Project ${timestamp.toString().slice(-4)}`,
      description: 'Testing end to end Kanban task assignment and status updates.',
      category: 'Software Engineering',
      teamSize: 3
    }
  );
  if (projectRes.status !== 201) throw new Error(`Project creation failed: ${JSON.stringify(projectRes.data)}`);
  projectId = projectRes.data.data.project._id;
  console.log(`   Project Created: ID ${projectId}`);

  // 5. Worker Applies to Project
  console.log('\n5. Worker Applying to Project...');
  const applyRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/projects/${projectId}/apply`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { coverMessage: 'Ready to work on tasks.' }
  );
  if (applyRes.status !== 201) throw new Error(`Application failed: ${JSON.stringify(applyRes.data)}`);
  const appId = applyRes.data.data.application._id;

  // 6. Owner Accepts Application (Worker becomes accepted team member)
  console.log('\n6. Owner Accepting Worker Application...');
  const acceptRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/applications/${appId}/accept`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    { role: 'Frontend Specialist' }
  );
  if (acceptRes.status !== 200) throw new Error(`Accept application failed: ${JSON.stringify(acceptRes.data)}`);
  teamId = acceptRes.data.data.team._id;
  console.log(`   Team Formed: ID ${teamId} with accepted worker ${workerId}`);

  // 7. Verify Assigning Non-Member Fails (Validation Check)
  console.log('\n7. Testing Assignee Validation (Assigning Non-Member Should Fail)...');
  const invalidAssignRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${teamId}/tasks`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    {
      title: 'Invalid Task Assignment',
      assignee: outsiderId
    }
  );
  console.log(`   Status Code: ${invalidAssignRes.status}, Message: "${invalidAssignRes.data.message}"`);
  if (invalidAssignRes.status !== 400 || !invalidAssignRes.data.message.includes('Only accepted team members')) {
    throw new Error('Assignee validation test failed: non-accepted worker was incorrectly allowed');
  }

  // 8. Step 1 & 2: Owner Creates Task (Initial Status = TO DO)
  console.log('\n8. [E2E STEP 1 & 2] Owner Creates Task (Status = TO DO)...');
  const createTaskRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${teamId}/tasks`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    {
      title: 'Implement Authentication Flow'
    }
  );
  if (createTaskRes.status !== 201) throw new Error(`Task creation failed: ${JSON.stringify(createTaskRes.data)}`);
  taskId = createTaskRes.data.data._id;
  console.log(`   Task Created: ID ${taskId}, Initial Status: "${createTaskRes.data.data.status}"`);
  if (createTaskRes.data.data.status !== 'To Do') {
    throw new Error(`Expected initial status 'To Do', got '${createTaskRes.data.data.status}'`);
  }

  // 9. Step 3: Owner Assigns Task to Accepted Worker
  console.log('\n9. [E2E STEP 3] Owner Assigns Task to Accepted Worker...');
  const assignRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${teamId}/tasks/${taskId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      }
    },
    { assignee: workerId }
  );
  if (assignRes.status !== 200) throw new Error(`Assign task failed: ${JSON.stringify(assignRes.data)}`);
  console.log(`   Assigned Worker Name: "${assignRes.data.data.assignee?.name}"`);

  // 10. Step 4: Worker Logs In & Sees Assigned Task
  console.log('\n10. [E2E STEP 4] Worker Logs In & Views Team Tasks...');
  const workerTasksRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/teams/${teamId}/tasks`,
    method: 'GET',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  if (workerTasksRes.status !== 200) throw new Error(`Worker get tasks failed: ${JSON.stringify(workerTasksRes.data)}`);
  const workerTask = workerTasksRes.data.data.find(t => t._id === taskId);
  console.log(`   Worker sees task: Title="${workerTask?.title}", Assignee="${workerTask?.assignee?.name}", Status="${workerTask?.status}"`);
  if (!workerTask || workerTask.assignee?._id !== workerId) {
    throw new Error('Worker could not see assigned task');
  }

  // 11. Step 5 & 6: Worker Starts Task (TO DO -> IN PROGRESS)
  console.log('\n11. [E2E STEP 5 & 6] Worker Starts Task (TO DO -> IN PROGRESS)...');
  const startTaskRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${teamId}/tasks/${taskId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { status: 'In Progress' }
  );
  if (startTaskRes.status !== 200) throw new Error(`Start task failed: ${JSON.stringify(startTaskRes.data)}`);
  console.log(`   Status updated in DB: "${startTaskRes.data.data.status}"`);

  // Verify Owner views IN PROGRESS status
  console.log('   Checking Owner View for IN PROGRESS...');
  const ownerCheckProgress = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/teams/${teamId}/tasks`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const ownerTaskProgress = ownerCheckProgress.data.data.find(t => t._id === taskId);
  console.log(`   Owner Kanban board shows: Status="${ownerTaskProgress?.status}", Assignee="${ownerTaskProgress?.assignee?.name}"`);
  if (ownerTaskProgress.status !== 'In Progress') {
    throw new Error(`Owner view check failed: expected 'In Progress', got '${ownerTaskTaskProgress?.status}'`);
  }

  // 12. Step 7 & 8: Worker Completes Task (IN PROGRESS -> DONE)
  console.log('\n12. [E2E STEP 7 & 8] Worker Completes Task (IN PROGRESS -> DONE)...');
  const completeTaskRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/teams/${teamId}/tasks/${taskId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`
      }
    },
    { status: 'Done' }
  );
  if (completeTaskRes.status !== 200) throw new Error(`Complete task failed: ${JSON.stringify(completeTaskRes.data)}`);
  console.log(`   Status updated in DB: "${completeTaskRes.data.data.status}"`);

  // Verify Owner views DONE status
  console.log('   Checking Owner View for DONE...');
  const ownerCheckDone = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/teams/${teamId}/tasks`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const ownerTaskDone = ownerCheckDone.data.data.find(t => t._id === taskId);
  console.log(`   Owner Kanban board shows: Status="${ownerTaskDone?.status}", Assignee="${ownerTaskDone?.assignee?.name}"`);
  if (ownerTaskDone.status !== 'Done') {
    throw new Error(`Owner view check failed: expected 'Done', got '${ownerTaskDone?.status}'`);
  }

  // 13. Step 9: Refresh & Database Direct Inspection
  console.log('\n13. [E2E STEP 9] Direct MongoDB Database Inspection & Verification...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teammatcher');
  const dbTeam = await Team.findById(teamId).populate('tasks.assignee', 'name email');
  const dbTask = dbTeam.tasks.id(taskId);

  console.log(`   MongoDB Task ID: ${dbTask._id}`);
  console.log(`   MongoDB Project ID: ${dbTask.project || dbTeam.project}`);
  console.log(`   MongoDB Task Title: "${dbTask.title}"`);
  console.log(`   MongoDB Status: "${dbTask.status}"`);
  console.log(`   MongoDB Assigned Worker ID: ${dbTask.assignee?._id || dbTask.assignee}`);
  console.log(`   MongoDB Assigned Worker Name: "${dbTask.assignee?.name}"`);
  console.log(`   MongoDB CreatedAt: ${dbTask.createdAt}`);
  console.log(`   MongoDB UpdatedAt: ${dbTask.updatedAt}`);

  if (dbTask.status !== 'Done') throw new Error('Database direct inspection failed: status is not Done');
  if (!dbTask.createdAt || !dbTask.updatedAt) throw new Error('Database direct inspection failed: timestamps missing');

  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log('  ✨ ALL KANBAN TASK E2E WORKFLOW TESTS PASSED SUCCESSFULLY! ✨');
  console.log('================================================================\n');
  process.exit(0);
};

runKanbanE2ETest().catch((err) => {
  console.error('\n❌ KANBAN TASK E2E TEST FAILED:', err);
  process.exit(1);
});
