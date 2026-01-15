const axios = require('axios');

const api = axios.create({ 
  baseURL: 'http://localhost:5000',
  timeout: 5000 
});

async function run() {
  // Wait for server to be ready
  let serverReady = false;
  let attempts = 0;
  
  while (!serverReady && attempts < 15) {
    try {
      await api.get('/');
      serverReady = true;
      console.log('✓ Server is ready\n');
    } catch (err) {
      attempts++;
      if (attempts % 5 === 0) console.log(`Waiting for server... (attempt ${attempts})`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  if (!serverReady) {
    console.error('❌ Server failed to start after 30 seconds');
    process.exit(1);
  }

  try {
    console.log('📝 Registering...');
    const reg = await api.post('/api/auth/register', { email: 'test+node@example.com', password: 'Password123' });
    console.log('✓ Register success:', reg.data);
  } catch (err) {
    console.error('❌ Register error:', err.response?.data || err.message);
  }

  try {
    console.log('\n🔐 Logging in...');
    const login = await api.post('/api/auth/login', { email: 'test+node@example.com', password: 'Password123' });
    console.log('✓ Login success:', login.data);
  } catch (err) {
    console.error('❌ Login error:', err.response?.data || err.message);
  }
}

run();
