const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { Anthropic } = require('@anthropic-ai/sdk');
const supabase = require('../config/supabase');

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'));
    }
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract text from different file types
async function extractTextFromFile(file) {
  const buffer = file.buffer;
  const mimetype = file.mimetype;

  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimetype === 'text/plain' || mimetype === 'text/markdown') {
      return buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to extract text from file');
  }
}

// Helper function to generate quiz using Claude AI
async function generateQuizWithAI(content, numQuestions = 10) {
  try {
    const prompt = `You are an expert quiz generator. Based on the following content, generate exactly ${numQuestions} multiple-choice questions that test understanding of the key concepts.

Content:
${content}

Generate exactly ${numQuestions} multiple-choice questions with 4 options each. For each question, provide:
1. The question text
2. Four answer options
3. Indicate which option is correct (use index 0-3)
4. A brief explanation of why the answer is correct

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "choices": [
      "First option",
      "Second option",
      "Third option",
      "Fourth option"
    ],
    "correct_index": 1,
    "explanation": "Explanation of why option at index 1 is correct"
  }
]

IMPORTANT: 
- Return ONLY the JSON array, no additional text or formatting
- Use index 0-3 for correct_index (0=first choice, 1=second, 2=third, 3=fourth)
- Make sure the questions test comprehension, not just memorization
- Ensure all ${numQuestions} questions are diverse and cover different aspects of the content`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the response text
    const responseText = message.content[0].text;
    
    // Parse the JSON response
    const questions = JSON.parse(responseText);
    
    return questions;
  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    throw new Error('Failed to generate quiz questions');
  }
}

// POST /api/quiz/generate - Generate quiz from uploaded file or text
router.post('/generate', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { text, numQuestions } = req.body;
    const file = req.file;
    
    let content = '';
    let sourceType = '';
    
    // Extract content from file or text
    if (file) {
      content = await extractTextFromFile(file);
      sourceType = 'file';
    } else if (text) {
      content = text;
      sourceType = 'text';
    } else {
      return res.status(400).json({ msg: 'Please provide either a file or text content' });
    }
    
    // Validate content length
    if (content.length < 100) {
      return res.status(400).json({ msg: 'Content is too short. Please provide at least 100 characters.' });
    }
    
    if (content.length > 50000) {
      content = content.substring(0, 50000);
    }
    
    // Generate quiz questions using AI
    const aiQuestions = await generateQuizWithAI(content, parseInt(numQuestions) || 10);
    
    if (!aiQuestions || aiQuestions.length === 0) {
      return res.status(500).json({ msg: 'Failed to generate questions' });
    }
    
    // Create a title from the first few words of content
    const title = content.substring(0, 50).trim() + (content.length > 50 ? '...' : '');
    
    // Insert quiz into database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          created_by_user_id: req.userId,
          title: title,
          description: `AI-generated quiz from ${sourceType}`,
          source_type: sourceType,
          source_content: content.substring(0, 1000)
        }
      ])
      .select()
      .single();
    
    if (quizError) {
      console.error('Error creating quiz:', quizError);
      return res.status(500).json({ msg: 'Failed to save quiz to database' });
    }
    
    // Insert questions and choices
    const questionPromises = aiQuestions.map(async (q) => {
      // Insert question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert([
          {
            quiz_id: quiz.id,
            question_text: q.question,
            question_type: 'multiple_choice',
            explanation: q.explanation
          }
        ])
        .select()
        .single();
      
      if (questionError) {
        throw new Error('Failed to insert question');
      }
      
      // Insert choices
      const choicePromises = q.choices.map((choiceText, index) => {
        return supabase
          .from('choices')
          .insert([
            {
              question_id: question.id,
              choice_text: choiceText,
              is_correct: index === q.correct_index
            }
          ])
          .select()
          .single();
      });
      
      const choiceResults = await Promise.all(choicePromises);
      
      // Check for errors
      const choiceErrors = choiceResults.filter(r => r.error);
      if (choiceErrors.length > 0) {
        throw new Error('Failed to insert choices');
      }
      
      return {
        ...question,
        choices: choiceResults.map(r => r.data)
      };
    });
    
    try {
      const insertedQuestions = await Promise.all(questionPromises);
      
      // Return the complete quiz with questions
      res.json({
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          created_at: quiz.created_at
        },
        questions: insertedQuestions.map(q => ({
          id: q.id,
          question: q.question_text,
          explanation: q.explanation,
          choices: q.choices.map(c => ({
            id: c.id,
            text: c.choice_text,
            is_correct: c.is_correct
          }))
        }))
      });
      
    } catch (insertError) {
      console.error('Error inserting questions/choices:', insertError);
      // Delete the quiz if questions failed to insert
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      return res.status(500).json({ msg: 'Failed to save questions to database' });
    }
    
  } catch (err) {
    console.error('Generate quiz error:', err);
    res.status(500).json({ msg: err.message || 'Server error while generating quiz' });
  }
});

// GET /api/quiz/:quizId - Get a specific quiz with questions
router.get('/:quizId', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Get quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('created_by_user_id', req.userId)
      .single();
    
    if (quizError || !quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });
    
    if (questionsError) {
      return res.status(500).json({ msg: 'Failed to fetch questions' });
    }
    
    // Get choices for all questions
    const questionIds = questions.map(q => q.id);
    const { data: choices, error: choicesError } = await supabase
      .from('choices')
      .select('*')
      .in('question_id', questionIds)
      .order('id', { ascending: true });
    
    if (choicesError) {
      return res.status(500).json({ msg: 'Failed to fetch choices' });
    }
    
    // Group choices by question
    const questionsWithChoices = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      explanation: q.explanation,
      choices: choices
        .filter(c => c.question_id === q.id)
        .map(c => ({
          id: c.id,
          text: c.choice_text,
          is_correct: c.is_correct
        }))
    }));
    
    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        created_at: quiz.created_at
      },
      questions: questionsWithChoices
    });
    
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/quiz/user/all - Get all quizzes for the authenticated user
router.get('/user/all', verifyToken, async (req, res) => {
  try {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('id, title, description, created_at')
      .eq('created_by_user_id', req.userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ msg: 'Failed to fetch quizzes' });
    }
    
    res.json({ quizzes });
    
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/quiz/:quizId - Delete a quiz
router.delete('/:quizId', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
      .eq('created_by_user_id', req.userId);
    
    if (error) {
      return res.status(500).json({ msg: 'Failed to delete quiz' });
    }
    
    res.json({ msg: 'Quiz deleted successfully' });
    
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/quiz/:quizId/submit - Submit quiz attempt and save results
router.post('/:quizId/submit', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, score, totalQuestions, startedAt } = req.body;
    
    // Insert quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          user_id: req.userId,
          quiz_id: quizId,
          score: score,
          started_at: startedAt,
          completed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (attemptError) {
      console.error('Error creating quiz attempt:', attemptError);
      return res.status(500).json({ msg: 'Failed to save quiz attempt' });
    }
    
    // Insert attempt answers if provided
    if (answers && answers.length > 0) {
      const answerData = answers.map(a => ({
        attempt_id: attempt.id,
        question_id: a.question_id,
        selected_choice_id: a.selected_choice_id
      }));
      
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .insert(answerData);
      
      if (answersError) {
        console.error('Error saving attempt answers:', answersError);
        // Don't fail the request if answers fail, attempt was saved
      }
    }
    
    res.json({
      attempt_id: attempt.id,
      score: attempt.score,
      completed_at: attempt.completed_at
    });
    
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
