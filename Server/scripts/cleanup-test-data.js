const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

async function cleanupTestData() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Delete test users (this will cascade to quizzes, questions, etc.)
  await supabase
    .from('users')
    .delete()
    .like('email', 'test%@example.com');

  console.log('Test data cleaned up');
}

cleanupTestData();