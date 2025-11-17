// Server/tests/quiz.simple.test.js
// FIXED TEST SUITE - Addresses all failing tests

const request = require('supertest');
const app = require('../index');

// Shared test data that will be populated during tests
let userToken;
let userId;
let quizId;
let quizData; // Store complete quiz data including questions

describe('SIMPLE TESTS - Quiz Generation', () => {

  // ========================================
  // SETUP: Create test user before tests
  // ========================================
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      });

    userToken = response.body.token;
    userId = response.body.user.id;
    
    console.log('✅ Test user created successfully');
  });

  // ========================================
  // TEST 1: Generate Quiz from Text
  // ========================================
  test('Should generate a quiz from text', async () => {
    // Use text longer than 100 characters (API requirement)
    const testText = `The Industrial Revolution was a period of major industrialization and innovation that took place during the late 1700s and early 1800s. 
    The Industrial Revolution began in Great Britain and quickly spread throughout the world. 
    This time period saw the mechanization of agriculture and textile manufacturing and a revolution in power, including steam ships and railroads, 
    that affected social, cultural and economic conditions. The Industrial Revolution marks a major turning point in history; 
    almost every aspect of daily life was influenced in some way. Average income and population began to exhibit unprecedented sustained growth.`;

    const response = await request(app)
      .post('/api/quiz/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        text: testText,
        numQuestions: 3
      });

    // Check if successful
    expect(response.status).toBe(200);
    
    // Check if quiz was created
    expect(response.body.quiz).toBeDefined();
    expect(response.body.quiz.id).toBeDefined();
    expect(response.body.quiz.title).toBeDefined();
    
    // Check if questions were created
    expect(response.body.questions).toBeDefined();
    expect(response.body.questions.length).toBe(3);
    
    // IMPORTANT: Store quiz data for later tests
    quizId = response.body.quiz.id;
    quizData = response.body;
    
    console.log(`✅ Quiz created with ID: ${quizId}`);
  });

  // ========================================
  // TEST 2: Reject Short Text
  // ========================================
  test('Should reject text that is too short', async () => {
    const response = await request(app)
      .post('/api/quiz/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        text: 'Short text',
        numQuestions: 5
      });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBeDefined();
    // API returns: "Content too short. Please provide at least 100 characters."
  });

  // ========================================
  // TEST 3: Require Authentication
  // ========================================
  test('Should require authentication', async () => {
    const response = await request(app)
      .post('/api/quiz/generate')
      .send({
        text: 'This is some text about science and how things work in nature. It contains information about various scientific concepts and principles that are important for understanding the world around us.',
        numQuestions: 3
      });

    expect(response.status).toBe(401);
    expect(response.body.msg).toBe('No token provided');
  });

  // ========================================
  // TEST 4: Validate Question Structure
  // ========================================
  test('Each question should have exactly 4 choices', async () => {
    // Use the quiz data from the first test
    expect(quizData).toBeDefined();
    expect(quizData.questions).toBeDefined();
    
    // Check each question has 4 choices
    quizData.questions.forEach(question => {
      expect(question.choices).toBeDefined();
      expect(question.choices.length).toBe(4);
    });
  });

  // ========================================
  // TEST 5: Validate Correct Answer
  // ========================================
  test('Each question should have exactly one correct answer', async () => {
    expect(quizData).toBeDefined();
    expect(quizData.questions).toBeDefined();
    
    // Check each question has exactly one correct answer
    quizData.questions.forEach(question => {
      const correctAnswers = question.choices.filter(c => c.is_correct === true);
      expect(correctAnswers.length).toBe(1);
    });
  });
});

describe('SIMPLE TESTS - Quiz Retrieval', () => {

  // ========================================
  // TEST 6: Get Specific Quiz by ID
  // ========================================
  test('Should get a specific quiz by ID', async () => {
    // Make sure we have a quiz ID from the generation tests
    expect(quizId).toBeDefined();

    const response = await request(app)
      .get(`/api/quiz/${quizId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.quiz).toBeDefined();
    expect(response.body.quiz.id).toBe(quizId);
    expect(response.body.questions).toBeDefined();
    expect(Array.isArray(response.body.questions)).toBe(true);
  });

  // ========================================
  // TEST 7: Get All User Quizzes
  // ========================================
  test('Should get all quizzes for a user', async () => {
    const response = await request(app)
      .get('/api/quiz/user/all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.quizzes).toBeDefined();
    expect(Array.isArray(response.body.quizzes)).toBe(true);
    expect(response.body.quizzes.length).toBeGreaterThan(0);
    
    // Should include our created quiz
    const ourQuiz = response.body.quizzes.find(q => q.id === quizId);
    expect(ourQuiz).toBeDefined();
  });

  // ========================================
  // TEST 8: Unauthorized Access
  // ========================================
  test('Should not access another user\'s quiz', async () => {
    // Create another user
    const otherUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `other${Date.now()}@example.com`,
        password: 'Test123!'
      });

    const otherUserToken = otherUserResponse.body.token;

    // Try to access our quiz with the other user's token
    const response = await request(app)
      .get(`/api/quiz/${quizId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Quiz not found');
  });
});

describe('SIMPLE TESTS - Quiz Submission', () => {

  // ========================================
  // TEST 9: Submit Quiz Successfully
  // ========================================
  test('Should submit quiz answers successfully', async () => {
    // Make sure we have quiz data
    expect(quizData).toBeDefined();
    expect(quizData.questions).toBeDefined();
    
    // Prepare answers (select first choice for each question)
    const answers = quizData.questions.map(q => ({
      question_id: q.id,
      selected_choice_id: q.choices[0].id
    }));

    // Calculate score (check how many we got correct)
    let correctCount = 0;
    quizData.questions.forEach((q, index) => {
      if (q.choices[0].is_correct) {
        correctCount++;
      }
    });

    const response = await request(app)
      .post(`/api/quiz/${quizId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: answers,
        score: correctCount,
        totalQuestions: quizData.questions.length,
        startedAt: new Date().toISOString()
      });

    expect(response.status).toBe(200);
    expect(response.body.attempt_id).toBeDefined();
    expect(response.body.score).toBe(correctCount);
    expect(response.body.completed_at).toBeDefined();
  });

  // ========================================
  // TEST 10: Submit Partial Answers
  // ========================================
  test('Should allow submitting partial answers', async () => {
    expect(quizData).toBeDefined();
    expect(quizData.questions).toBeDefined();
    
    // Only answer first 2 questions
    const partialAnswers = quizData.questions.slice(0, 2).map(q => ({
      question_id: q.id,
      selected_choice_id: q.choices[0].id
    }));

    const response = await request(app)
      .post(`/api/quiz/${quizId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        answers: partialAnswers,
        score: 1,
        totalQuestions: quizData.questions.length,
        startedAt: new Date().toISOString()
      });

    expect(response.status).toBe(200);
    expect(response.body.attempt_id).toBeDefined();
  });
});

describe('SIMPLE TESTS - Error Handling', () => {

  // ========================================
  // TEST 11: Reject Empty Content
  // ========================================
  test('Should reject request with no content', async () => {
    const response = await request(app)
      .post('/api/quiz/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        numQuestions: 5
      });

    expect(response.status).toBe(400);
  });

  // ========================================
  // TEST 12: Non-existent Quiz
  // ========================================
  test('Should return 404 for non-existent quiz', async () => {
    // Use a UUID that doesn't exist
    const fakeQuizId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request(app)
      .get(`/api/quiz/${fakeQuizId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Quiz not found');
  });
});

// Clean up after all tests
afterAll(async () => {
  console.log('\n✅ All tests completed');
  console.log(`Created quiz ID: ${quizId}`);
  console.log('Note: Test data will remain in database');
});