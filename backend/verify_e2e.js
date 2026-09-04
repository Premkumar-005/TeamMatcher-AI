import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

const runE2EVerification = async () => {
  console.log('========================================================');
  console.log('    TEAMMATCHER END-TO-END MERN INTEGRATION TEST');
  console.log('========================================================\n');

  // Step 1: Check Frontend Dev Server
  console.log('1. Checking Frontend Dev Server (http://localhost:5173)...');
  const feRes = await makeRequest({
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET'
  });
  console.log(`   Frontend Status: ${feRes.status} (HTML content received: ${feRes.raw.includes('<div id="root">')})`);
  if (feRes.status !== 200) {
    throw new Error('Frontend server is not responding');
  }

  // Step 2: Check Backend Health
  console.log('\n2. Checking Backend Health (http://localhost:5000/api/health)...');
  const healthRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`   Backend Status: ${healthRes.status}, Message: "${healthRes.data.message}"`);
  if (healthRes.status !== 200 || !healthRes.data.success) {
    throw new Error('Backend health check failed');
  }

  // Step 3: Register New User
  const uniqueSuffix = Date.now();
  const testUser = {
    name: 'Logeshwaran Dev',
    email: `logesh.mern.${uniqueSuffix}@teammatcher.ai`,
    password: 'SecurePassword2026!',
    title: 'Lead Full Stack & AI Engineer',
    bio: 'Building scalable collaborative developer ecosystems with React & Express.',
    college: 'State Technical University',
    degree: 'B.Tech Information Technology',
    selectedSkills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
    interests: ['Web Architecture', 'Machine Learning', 'Cloud Infrastructure'],
    experienceLevel: 'Intermediate',
    github: 'logeshwaran-dev',
    linkedin: 'logeshwaran-official',
    portfolio: 'https://logesh.dev'
  };

  console.log(`\n3. Registering User (${testUser.email})...`);
  const regRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    testUser
  );
  console.log(`   Status: ${regRes.status}, Success: ${regRes.data.success}, Message: "${regRes.data.message}"`);
  console.log(`   User ID in MongoDB: ${regRes.data.data?.user?._id}`);
  console.log(`   Computed Profile Completion: ${regRes.data.data?.user?.profileCompletion}%`);
  if (regRes.status !== 201 || !regRes.data.data?.token) {
    throw new Error('Registration failed');
  }
  const token = regRes.data.data.token;

  // Step 4: Login with Credentials
  console.log('\n4. Logging in with Registered User...');
  const loginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testUser.email, password: testUser.password }
  );
  console.log(`   Status: ${loginRes.status}, Success: ${loginRes.data.success}, Message: "${loginRes.data.message}"`);
  if (loginRes.status !== 200 || !loginRes.data.data?.token) {
    throw new Error('Login failed');
  }

  // Step 5: Verify GET /api/auth/me (Protected)
  console.log('\n5. Fetching Current User with JWT (GET /api/auth/me)...');
  const meRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`   Status: ${meRes.status}, User Name: "${meRes.data.data?.user?.name}", Email: "${meRes.data.data?.user?.email}"`);
  if (meRes.status !== 200 || meRes.data.data?.user?.email !== testUser.email) {
    throw new Error('Auth verification /me failed');
  }

  // Step 6: Update Profile Details (PUT /api/users/me)
  console.log('\n6. Updating Profile Details (PUT /api/users/me)...');
  const updatedBio = 'Senior Full Stack & AI Architect building high-performance MERN microservices.';
  const updateRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/me',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    },
    {
      bio: updatedBio,
      experienceLevel: 'Advanced',
      github: 'logeshwaran-fullstack'
    }
  );
  console.log(`   Status: ${updateRes.status}, Updated Github: "${updateRes.data.data?.user?.github}", Experience: "${updateRes.data.data?.user?.experienceLevel}"`);
  if (updateRes.status !== 200 || updateRes.data.data?.user?.github !== 'logeshwaran-fullstack') {
    throw new Error('Profile update failed');
  }

  // Step 7: Update Skills & Proficiencies (PUT /api/users/me/skills)
  console.log('\n7. Updating Skills & Proficiencies (PUT /api/users/me/skills)...');
  const newSkills = [
    { name: 'React', proficiency: 95 },
    { name: 'Node.js', proficiency: 90 },
    { name: 'Express.js', proficiency: 88 },
    { name: 'MongoDB', proficiency: 85 },
    { name: 'FastAPI', proficiency: 80 }
  ];
  const skillsRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/me/skills',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    },
    { skills: newSkills }
  );
  console.log(`   Status: ${skillsRes.status}, Total Skills in MongoDB: ${skillsRes.data.data?.skills?.length}`);
  console.log(`   Updated Profile Completion: ${skillsRes.data.data?.profileCompletion}%`);
  if (skillsRes.status !== 200 || skillsRes.data.data?.skills?.length !== 5) {
    throw new Error('Skills update failed');
  }

  // Step 8: Verify MongoDB Database Direct Inspection
  console.log('\n8. Directly Inspecting MongoDB Database Document...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teammatcher');
  const dbUser = await User.findOne({ email: testUser.email }).select('+password');
  console.log(`   MongoDB Document ID: ${dbUser._id}`);
  console.log(`   MongoDB Name: ${dbUser.name}`);
  console.log(`   MongoDB Bio: "${dbUser.bio}"`);
  console.log(`   MongoDB Skills: [${dbUser.skills.map((s) => `${s.name}: ${s.proficiency}%`).join(', ')}]`);
  console.log(`   MongoDB Password Hash exists: ${Boolean(dbUser.password && dbUser.password.startsWith('$2'))}`);
  console.log(`   MongoDB Profile Completion: ${dbUser.profileCompletion}%`);
  console.log(`   MongoDB CreatedAt: ${dbUser.createdAt}, UpdatedAt: ${dbUser.updatedAt}`);

  await mongoose.disconnect();

  console.log('\n========================================================');
  console.log('    ✨ ALL INTEGRATION & DATABASE TESTS PASSED! ✨');
  console.log('========================================================\n');
  process.exit(0);
};

runE2EVerification().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
