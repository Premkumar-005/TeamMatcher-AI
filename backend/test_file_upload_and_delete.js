/**
 * E2E Test: Shared Files Upload + Owner Project Delete
 * Uses only Node.js built-in modules (http, fs, path) + mongoose (already in backend deps)
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Project from './src/models/Project.js';
import ProjectApplication from './src/models/ProjectApplication.js';
import Team from './src/models/Team.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── HTTP helpers ────────────────────────────────────────────────────────────
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, data: body, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const jsonReq = (method, path, body, token) => {
  const payload = body ? JSON.stringify(body) : '';
  return makeRequest({
    hostname: 'localhost', port: 5000,
    path: `/api${path}`, method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }, payload || undefined);
};

// Multipart upload helper using http module directly
const multipartUpload = (apiPath, filePath, token) => {
  return new Promise((resolve, reject) => {
    const boundary = `----FormBoundary${Date.now()}`;
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    const preamble = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: text/plain\r\n\r\n`
    );
    const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([preamble, fileContent, epilogue]);

    const req = http.request({
      hostname: 'localhost', port: 5000,
      path: `/api${apiPath}`, method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        Authorization: `Bearer ${token}`
      }
    }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch (e) { resolve({ status: res.statusCode, data: raw }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// Static file fetch
const fetchStatic = (urlPath) => {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 5000, path: urlPath }, (res) => {
      let body = Buffer.alloc(0);
      res.on('data', (c) => { body = Buffer.concat([body, c]); });
      res.on('end', () => resolve({ status: res.statusCode, length: body.length }));
    }).on('error', reject);
  });
};

// ─── test utilities ──────────────────────────────────────────────────────────
const pass = (msg) => console.log(`   ✅  ${msg}`);
const fail = (msg) => { console.error(`   ❌  ${msg}`); process.exit(1); };
const ts = () => Math.random().toString(36).slice(2, 8);

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n=================================================================');
  console.log('   FILE UPLOAD + PROJECT DELETE — E2E VERIFICATION SUITE');
  console.log('=================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

  let ownerToken, workerToken, projectId, teamId, fileId;
  let testFilePath;

  try {
    // 1. Register owner
    console.log('1. Registering Owner...');
    const ownerRes = await jsonReq('POST', '/auth/register', {
      name: 'File Owner', email: `file-owner-${ts()}@test.com`,
      password: 'Test1234!', role: 'OWNER', company: 'FileTestCorp'
    });
    ownerToken = ownerRes.data.data?.token;
    const ownerId = ownerRes.data.data?.user?._id;
    if (!ownerToken) fail('Owner registration failed: ' + JSON.stringify(ownerRes.data));
    pass(`Owner registered: ID ${ownerId}`);

    // 2. Register worker
    console.log('2. Registering Worker...');
    const workerRes = await jsonReq('POST', '/auth/register', {
      name: 'File Worker', email: `file-worker-${ts()}@test.com`,
      password: 'Test1234!', role: 'WORKER'
    });
    workerToken = workerRes.data.data?.token;
    const workerId = workerRes.data.data?.user?._id;
    if (!workerToken) fail('Worker registration failed');
    pass(`Worker registered: ID ${workerId}`);

    // 3. Owner creates project
    console.log('3. Owner creates project...');
    const projRes = await jsonReq('POST', '/projects', {
      title: 'File Upload Test Project', description: 'Testing file upload and delete functionality',
      category: 'Developer Tools & SaaS',
      requiredSkills: [{ name: 'Node.js', requiredLevel: 70 }],
      teamSize: 2, workMode: 'Remote'
    }, ownerToken);
    projectId = projRes.data.data?.project?._id;
    if (!projectId) fail('Project creation failed: ' + JSON.stringify(projRes.data));
    pass(`Project created: ID ${projectId}`);

    // 4. Worker applies
    console.log('4. Worker applies to project...');
    const applyRes = await jsonReq('POST', `/projects/${projectId}/apply`, { coverMessage: 'Ready!' }, workerToken);
    if (!applyRes.data.success) fail('Apply failed: ' + JSON.stringify(applyRes.data));
    pass('Application submitted');

    // 5. Owner accepts → team formed
    console.log('5. Owner accepts worker (forms team)...');
    const appsRes = await jsonReq('GET', `/projects/${projectId}/applications`, null, ownerToken);
    const appId = appsRes.data.data?.[0]?._id;
    if (!appId) fail('No application found');
    const acceptRes = await jsonReq('PUT', `/applications/${appId}/accept`, { role: 'Developer' }, ownerToken);
    teamId = acceptRes.data.data?.team?._id;
    if (!teamId) fail('Team not formed: ' + JSON.stringify(acceptRes.data));
    pass(`Team formed: ID ${teamId}`);

    // 6. Create temp test file
    console.log('6. Creating real temp file for upload test...');
    testFilePath = path.join(__dirname, `test-upload-${ts()}.txt`);
    fs.writeFileSync(testFilePath,
      'This is a REAL file uploaded to TeamMatcher workspace.\n' +
      `Generated: ${new Date().toISOString()}\n`
    );
    pass(`Temp file created: ${path.basename(testFilePath)}`);

    // 7. Upload real file via multipart
    console.log('7. Uploading real file to team workspace (multipart/form-data)...');
    const uploadRes = await multipartUpload(`/teams/${teamId}/files`, testFilePath, ownerToken);
    if (!uploadRes.data.success) fail('File upload failed: ' + JSON.stringify(uploadRes.data));
    const uploaded = uploadRes.data.data;
    fileId = uploaded._id;
    pass(`File stored — name: "${uploaded.name}", size: "${uploaded.size}", url: "${uploaded.url}"`);
    if (!uploaded.name) fail('Missing name in upload response');
    if (!uploaded.url) fail('Missing url in upload response');
    if (!uploaded.size || uploaded.size === '0 KB') fail(`Invalid size: "${uploaded.size}"`);
    if (!uploaded.uploadedBy) fail('uploadedBy not populated');
    if (!uploaded.uploadedAt) fail('uploadedAt missing');
    pass(`Uploader: "${uploaded.uploadedBy.name}", Date: ${uploaded.uploadedAt}`);

    // 8. GET /files to verify persistence (file survives across requests)
    console.log('8. Verifying file persistence (GET /teams/:teamId/files)...');
    const filesRes = await jsonReq('GET', `/teams/${teamId}/files`, null, ownerToken);
    const found = (filesRes.data.data || []).find((f) => f._id === fileId);
    if (!found) fail(`File ${fileId} not returned by GET /files`);
    pass(`File persisted in DB: "${found.name}"`);

    // 9. Verify static download URL is accessible
    console.log('9. Verifying static file download URL is accessible...');
    const staticRes = await fetchStatic(uploaded.url);
    if (staticRes.status !== 200) fail(`Static URL "${uploaded.url}" returned ${staticRes.status}`);
    pass(`Download URL accessible: ${uploaded.url} (${staticRes.length} bytes returned)`);

    // 10. Verify MongoDB directly
    console.log('10. Direct MongoDB verification of file metadata...');
    const teamDoc = await Team.findById(teamId).populate('files.uploadedBy', 'name');
    const mongoFile = teamDoc.files.find((f) => f._id.toString() === fileId);
    if (!mongoFile) fail('File not found in MongoDB Team document');
    pass(`MongoDB — name: "${mongoFile.name}", size: "${mongoFile.size}", uploader: "${mongoFile.uploadedBy?.name}"`);

    // 11. Owner deletes project
    console.log('11. Owner deletes project (cascade cleanup)...');
    const deleteRes = await jsonReq('DELETE', `/projects/${projectId}`, null, ownerToken);
    if (!deleteRes.data.success) fail('Delete returned failure: ' + JSON.stringify(deleteRes.data));
    pass('Project deleted via API');

    // 12. Verify project is 404
    console.log('12. Verifying project returns 404 after deletion...');
    const proj404 = await jsonReq('GET', `/projects/${projectId}`, null, workerToken);
    if (proj404.status !== 404) fail(`Expected 404, got ${proj404.status}`);
    pass('Project correctly returns 404');

    // 13. Verify team is cleaned up in DB
    console.log('13. Verifying team is cleaned up in MongoDB...');
    const teamGone = await Team.findById(teamId);
    if (teamGone) fail('Team still exists in MongoDB after project deletion');
    pass('Team removed from MongoDB');

    // 14. Verify applications cleaned up
    console.log('14. Verifying applications are cleaned up...');
    const appsGone = await ProjectApplication.find({ project: projectId });
    if (appsGone.length > 0) fail(`${appsGone.length} applications still exist`);
    pass('Applications removed from MongoDB');

    // 15. Verify worker's /projects/my no longer shows deleted project
    console.log('15. Verifying worker no longer sees deleted project in /projects/my...');
    const myProjsRes = await jsonReq('GET', '/projects/my', null, workerToken);
    const stillVisible = (myProjsRes.data.data || []).find(
      (p) => (p._id || p.id || '').toString() === projectId
    );
    if (stillVisible) fail('Deleted project still appears in worker /projects/my');
    pass('Deleted project absent from worker projects list');

    // Cleanup temp file
    try { fs.unlinkSync(testFilePath); } catch (_) {}

    console.log('\n=================================================================');
    console.log('  ✨  ALL FILE UPLOAD + DELETE E2E TESTS PASSED!');
    console.log('=================================================================\n');
  } catch (err) {
    try { if (testFilePath) fs.unlinkSync(testFilePath); } catch (_) {}
    fail(`Unexpected error: ${err.message}\n${err.stack}`);
  } finally {
    await mongoose.disconnect();
  }
})();
