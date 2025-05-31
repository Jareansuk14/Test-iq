const express = require('express');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Test IQ Option API
function testIQOption() {
  const scriptPath = path.join(__dirname, 'test_iq.py');
  const command = `python "${scriptPath}" BTCUSD 20:00`;
  
  console.log('🚀 Starting IQ Option test...');
  console.log(`📞 Command: ${command}`);
  
  exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error:', error.message);
      console.error('📝 Stderr:', stderr);
      return;
    }
    
    if (stderr) {
      console.log('🔍 Debug:', stderr);
    }
    
    if (stdout) {
      try {
        const result = JSON.parse(stdout.trim());
        console.log('✅ Success!');
        console.log('📊 Result:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('📝 Raw output:', stdout);
      }
    }
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🧪 IQ Option Test Server',
    status: 'running',
    time: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  testIQOption();
  res.json({
    message: '🚀 Test started',
    check: 'logs for results'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 Test server running on port ${PORT}`);
  
  // Auto test เมื่อ server เริ่ม
  setTimeout(() => {
    console.log('🎯 Auto-testing in 3 seconds...');
    testIQOption();
  }, 3000);
});