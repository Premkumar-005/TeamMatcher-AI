import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './src/server.js';
import User from './src/models/User.js';

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

const runTests = async () => {
  console.log('--- STARTING BACKEND API TESTS ---');

  // Allow server to initialize
  await new Promise((r) => setTimeout(r, 1000));

  const testEmail = `test.dev.${Date.now()}@teammatcher.ai`;
  const testPassword = 'Password123!';
  let authToken = '';

  // 1. Test Health Endpoint
  console.log('\n1. Testing GET /api/health');
  const healthRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Status:', healthRes.status, 'Response:', healthRes.data);
  if (healthRes.status !== 200 || !healthRes.data.success) {
    throw new Error('Health check failed');
  }

  // 2. Test Registration (Valid)
  console.log('\n2. Testing POST /api/auth/register (Valid)');
  const registerPayload = {
    name: 'Test Developer',
    email: testEmail,
    password: testPassword,
    title: 'Senior Full Stack Engineer',
    bio: 'Experienced MERN developer',
    institution: 'Tech Institute',
    degree: 'B.S. Computer Science',
    selectedSkills: ['React', 'Node.js', 'MongoDB', 'Express.js'],
    interests: ['Web Development', 'AI', 'Cloud'],
    experienceLevel: 'Intermediate',
    role: 'WORKER',
    github: 'test-dev',
    linkedin: 'test-dev-official'
  };

  const regRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    registerPayload
  );
  console.log('Status:', regRes.status, 'Success:', regRes.data.success, 'Token received:', !!regRes.data?.data?.token);
  if (regRes.status !== 201 || !regRes.data.success || !regRes.data.data.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  }
  authToken = regRes.data.data.token;
  console.log('Profile Completion Score:', regRes.data.data.user.profileCompletion);

  // 3. Test Registration (Duplicate Email)
  console.log('\n3. Testing POST /api/auth/register (Duplicate Email)');
  const dupRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    registerPayload
  );
  console.log('Status:', dupRes.status, 'Expected 409. Message:', dupRes.data.message);
  if (dupRes.status !== 409) {
    throw new Error(`Duplicate registration did not return 409: status ${dupRes.status}`);
  }

  // 4. Test Login (Invalid Credentials)
  console.log('\n4. Testing POST /api/auth/login (Invalid Password)');
  const badLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testEmail, password: 'WrongPassword123' }
  );
  console.log('Status:', badLoginRes.status, 'Expected 401. Message:', badLoginRes.data.message);
  if (badLoginRes.status !== 401) {
    throw new Error('Invalid login did not return 401');
  }

  // 5. Test Login (Valid Credentials)
  console.log('\n5. Testing POST /api/auth/login (Valid Credentials)');
  const loginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testEmail, password: testPassword }
  );
  console.log('Status:', loginRes.status, 'Success:', loginRes.data.success, 'User returned:', loginRes.data?.data?.user?.email);
  if (loginRes.status !== 200 || !loginRes.data.success || !loginRes.data.data.token) {
    throw new Error('Valid login failed');
  }
  authToken = loginRes.data.data.token;

  // 6. Test GET /api/auth/me (Protected - Valid Token)
  console.log('\n6. Testing GET /api/auth/me (Protected)');
  const meRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Status:', meRes.status, 'User Name:', meRes.data?.data?.user?.name);
  if (meRes.status !== 200 || !meRes.data.success) {
    throw new Error('GET /api/auth/me failed');
  }

  // 7. Test GET /api/auth/me (Missing Token)
  console.log('\n7. Testing GET /api/auth/me (Missing Token)');
  const noTokenRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  console.log('Status:', noTokenRes.status, 'Expected 401. Message:', noTokenRes.data.message);
  if (noTokenRes.status !== 401) {
    throw new Error('Missing token did not return 401');
  }

  // 8. Test PUT /api/users/me (Update Profile)
  console.log('\n8. Testing PUT /api/users/me (Update Profile)');
  const updateProfilePayload = {
    bio: 'Updated bio for testing MERN architecture',
    github: 'test-dev-updated',
    linkedin: 'test-dev-linkedin-updated',
    experienceLevel: 'Advanced'
  };
  const updateRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/me',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    },
    updateProfilePayload
  );
  console.log('Status:', updateRes.status, 'Updated github:', updateRes.data?.data?.user?.github);
  if (updateRes.status !== 200 || updateRes.data?.data?.user?.github !== 'test-dev-updated') {
    throw new Error('Profile update failed');
  }

  // 9. Test PUT /api/users/me/skills (Update Skills & Proficiency)
  console.log('\n9. Testing PUT /api/users/me/skills (Update Skills)');
  const updateSkillsPayload = {
    skills: [
      { name: 'React', proficiency: 92 },
      { name: 'Node.js', proficiency: 88 },
      { name: 'TypeScript', proficiency: 85 }
    ]
  };
  const skillsRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/me/skills',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    },
    updateSkillsPayload
  );
  console.log('Status:', skillsRes.status, 'Skills count:', skillsRes.data?.data?.skills?.length);
  if (skillsRes.status !== 200 || skillsRes.data?.data?.skills?.length !== 3) {
    throw new Error('Skills update failed');
  }

  // 10. Verify MongoDB directly
  console.log('\n10. Verifying MongoDB Database Persistence');
  const userInDB = await User.findOne({ email: testEmail });
  console.log('Found user in MongoDB:', userInDB.name, 'Skills:', userInDB.skills.map((s) => `${s.name} (${s.proficiency}%)`));
  if (!userInDB || userInDB.skills.length !== 3) {
    throw new Error('MongoDB verification failed');
  }

  console.log('\n ALL 10 BACKEND API TESTS PASSED SUCCESSFULLY! \n');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
