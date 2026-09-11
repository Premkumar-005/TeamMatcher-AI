import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Team from './src/models/Team.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'teammatcher_jwt_secret_key_production_ready_2026';

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teammatcher');

const kumar = await User.findOne({ email: 'kumar@gmail.com' });
const prem = await User.findOne({ email: 'premkumar@gmail.com' });

const kumarToken = jwt.sign({ id: kumar._id }, JWT_SECRET, { expiresIn: '7d' });
const premToken = jwt.sign({ id: prem._id }, JWT_SECRET, { expiresIn: '7d' });

const requestApi = (path, method = 'GET', token = '', body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const premTeamsRes = await requestApi('/api/teams/my', 'GET', premToken);
const mernTeam = premTeamsRes.data.data.find(t => t.name.includes('Mern Project'));

console.log('Sending message as Prem...');
const sendRes = await requestApi(`/api/teams/${mernTeam._id}/messages`, 'POST', premToken, { text: 'Testing real sender name resolution' });
console.log('Send message status:', sendRes.status);
console.log('Created message data:');
console.log('  sender:', sendRes.data.data.sender?.name, 'senderId:', sendRes.data.data.senderId?.name, 'text:', sendRes.data.data.text);

// Now fetch as Kumar
console.log('\nFetching as Kumar to verify Prem message display:');
const kumarCheck = await requestApi('/api/teams/my', 'GET', kumarToken);
const mernKumar = kumarCheck.data.data.find(t => t.name.includes('Mern Project'));
const lastMsg = mernKumar.messages[mernKumar.messages.length - 1];
console.log('  Last message in Kumar view: sender.name="' + lastMsg.sender?.name + '", text="' + lastMsg.text + '"');

// Clean up the test message so we don't pollute the user's chat history
await Team.updateOne({ _id: mernTeam._id }, { $pull: { messages: { _id: lastMsg._id } } });
console.log('Test message cleanly removed.');

await mongoose.disconnect();
