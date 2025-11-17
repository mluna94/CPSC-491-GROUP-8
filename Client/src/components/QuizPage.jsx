import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:5000/api/quiz/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Quiz not found');
        return res.json();
      })
      .then(data => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(() => {
        alert('Quiz not found or access denied');
        navigate('/history');
      });
  }, [id, navigate]);

  if (loading) return <div className="p-6">Loading quiz...</div>;
  if (!quiz) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/history')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to History
      </button>

      <h1 className="text-2xl font-bold mb-2">{quiz.quiz.title}</h1>
      <p className="text-gray-600 mb-6">{quiz.quiz.description}</p>

      <div className="space-y-6">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="border rounded p-4 bg-gray-50">
            <p className="font-medium mb-2">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-1">
              {q.choices.map((c, j) => (
                <label key={c.id} className="block">
                  <input type="radio" name={`q${i}`} disabled /> {c.text}
                  {c.is_correct && <span className="ml-2 text-green-600">Correct</span>}
                </label>
              ))}
            </div>
            {q.explanation && (
              <p className="mt-2 text-sm text-gray-700">
                <strong>Explanation:</strong> {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/history')}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Back to History
      </button>
    </div>
  );
}