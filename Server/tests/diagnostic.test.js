// Server/tests/diagnostic.test.js
// Run this FIRST to verify your setup before running actual tests

const request = require('supertest');
const app = require('../index');
const supabase = require('../config/supabase');

describe('🔍 DIAGNOSTIC TESTS - Setup Verification', () => {
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   RUNNING DIAGNOSTIC CHECKS            ║');
  console.log('╚════════════════════════════════════════╝\n');

  // ========================================
  // CHECK 1: Environment Variables
  // ========================================
  test('Environment variables should be set', () => {
    console.log('📋 Checking environment variables...\n');
    
    const requiredVars = [
      'JWT_SECRET',
      'ANTHROPIC_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'  // Changed from SUPABASE_KEY
    ];
    
    const missing = [];
    
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: Set (${process.env[varName].substring(0, 10)}...)`);
      } else {
        console.log(`❌ ${varName}: NOT SET`);
        missing.push(varName);
      }
    });
    
    console.log('');
    expect(missing.length).toBe(0);
  });

  // ========================================
  // CHECK 2: Server Health
  // ========================================
  test('Server should be running', async () => {
    console.log('🏥 Checking server health...\n');
    
    const response = await request(app).get('/api/health');
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.body)}\n`);
    
    expect(response.status).toBe(200);
  });

  // ========================================
  // CHECK 3: Supabase Connection
  // ========================================
  test('Supabase should be connected', async () => {
    console.log('🗄️  Checking Supabase connection...\n');
    
    try {
      // Try to query a table
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ Supabase Error: ${error.message}\n`);
        throw error;
      }
      
      console.log('✅ Supabase connected successfully\n');
      expect(error).toBeNull();
      
    } catch (err) {
      console.log(`❌ Failed to connect to Supabase: ${err.message}\n`);
      throw err;
    }
  });

  // ========================================
  // CHECK 4: Database Tables Exist
  // ========================================
  test('Required database tables should exist', async () => {
    console.log('📊 Checking database tables...\n');
    
    const requiredTables = [
      'users',
      'quizzes',
      'questions',
      'choices',
      'quiz_attempts'
    ];
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${tableName}': ERROR - ${error.message}`);
          throw error;
        } else {
          console.log(`✅ Table '${tableName}': EXISTS`);
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}': MISSING or ERROR\n`);
        throw err;
      }
    }
    
    console.log('');
  });

  // ========================================
  // CHECK 5: User Registration
  // ========================================
  test('User registration should work', async () => {
    console.log('👤 Testing user registration...\n');
    
    const testEmail = `diagnostic${Date.now()}@test.com`;
    
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Test123!'
      });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.body, null, 2)}\n`);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ User registration works');
      console.log(`✅ Token received: ${response.body.token?.substring(0, 20)}...\n`);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    } else {
      console.log('❌ User registration failed\n');
      throw new Error(`Registration failed with status ${response.status}`);
    }
  });

  // ========================================
  // CHECK 6: Authentication
  // ========================================
  test('JWT token authentication should work', async () => {
    console.log('🔐 Testing authentication...\n');
    
    // Register a user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `authtest${Date.now()}@test.com`,
        password: 'Test123!'
      });
    
    const token = registerResponse.body.token;
    console.log(`Token: ${token?.substring(0, 30)}...`);
    
    // Try to access protected endpoint
    const response = await request(app)
      .get('/api/quiz/user/all')
      .set('Authorization', `Bearer ${token}`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.body, null, 2)}\n`);
    
    if (response.status === 200) {
      console.log('✅ Authentication works\n');
      expect(response.status).toBe(200);
    } else {
      console.log('❌ Authentication failed\n');
      throw new Error(`Auth failed with status ${response.status}`);
    }
  });

  // ========================================
  // CHECK 7: Text Content Length Validation
  // ========================================
  test('API should validate text length', async () => {
    console.log('📏 Testing content length validation...\n');
    
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `lengthtest${Date.now()}@test.com`,
        password: 'Test123!'
      });
    
    const token = registerResponse.body.token;
    
    // Try with short text (should fail)
    const shortResponse = await request(app)
      .post('/api/quiz/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Too short',
        numQuestions: 3
      });
    
    console.log(`Short text response: ${shortResponse.status}`);
    console.log(`Message: ${shortResponse.body.msg}\n`);
    
    expect(shortResponse.status).toBe(400);
    expect(shortResponse.body.msg).toMatch(/too short|at least 100 characters/i);
    
    console.log('✅ Content length validation works\n');
  });

  // ========================================
  // CHECK 8: Anthropic API (Optional)
  // ========================================
  test('Anthropic API key should be valid (this may take a moment)', async () => {
    console.log('🤖 Testing Anthropic API...\n');
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  ANTHROPIC_API_KEY not set, skipping\n');
      return;
    }
    
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `aitest${Date.now()}@test.com`,
        password: 'Test123!'
      });
    
    const token = registerResponse.body.token;
    
    // Try to generate a quiz with valid text
    const longText = `The theory of relativity, developed by Albert Einstein in the early 20th century, 
    revolutionized our understanding of space, time, gravity, and the universe. The theory consists of 
    two parts: special relativity and general relativity. Special relativity, published in 1905, 
    introduced the famous equation E=mc² and showed that time and space are relative rather than absolute.
    General relativity, published in 1915, extended these ideas to include gravity, showing that massive 
    objects curve the fabric of spacetime itself.`;
    
    const response = await request(app)
      .post('/api/quiz/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: longText,
        numQuestions: 2
      });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Anthropic API works');
      console.log(`✅ Generated ${response.body.questions?.length} questions\n`);
      expect(response.status).toBe(200);
      expect(response.body.questions).toBeDefined();
    } else {
      console.log('❌ Anthropic API request failed');
      console.log(`Error: ${response.body.msg}\n`);
      // Don't fail the test, just warn
      console.warn('⚠️  Warning: Anthropic API may not be configured correctly');
    }
  }, 30000); // 30 second timeout for AI generation

});

// ========================================
// FINAL SUMMARY
// ========================================
afterAll(() => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   DIAGNOSTIC TESTS COMPLETE            ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n✨ If all checks passed, you\'re ready to run the main tests!\n');
  console.log('Run: npm test tests/quiz.simple.test.js\n');
});