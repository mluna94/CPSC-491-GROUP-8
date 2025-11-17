const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser(email, password = 'Test123!@#') {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Delete existing test user if exists
    await supabase
      .from('users')
      .delete()
      .eq('email', email);

    // Create new test user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password_hash }])
      .select()
      .single();

    if (error) throw error;

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

async function cleanupTestUsers() {
  try {
    await supabase
      .from('users')
      .delete()
      .like('email', 'test%@example.com');
  } catch (error) {
    console.error('Error cleaning up test users:', error);
  }
}

module.exports = {
  createTestUser,
  cleanupTestUsers,
  supabase
};