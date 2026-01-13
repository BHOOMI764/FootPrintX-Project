const axios = require('axios');

const api = axios.create({ baseURL: 'http://localhost:5001' });

async function run() {
  try {
    console.log('Registering...');
    const reg = await api.post('/api/auth/register', { email: 'test+node@example.com', password: 'Password123' });
    console.log('Register response:', reg.data);
  } catch (err) {
    console.error('Register error full:', err && err.toJSON ? err.toJSON() : err);
  }

  try {
    console.log('Logging in...');
    const login = await api.post('/api/auth/login', { email: 'test+node@example.com', password: 'Password123' });
    console.log('Login response:', login.data);
  } catch (err) {
    console.error('Login error full:', err && err.toJSON ? err.toJSON() : err);
  }
}

run();
