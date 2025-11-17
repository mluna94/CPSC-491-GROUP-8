import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuizHistory() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/quiz/user/all', {  // FULL URL
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then(data => {
          setQuizzes(data.quizzes || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load history: ' + err.message);
          setLoading(false);
        });
    }, [navigate]);

  if (loading) return <div className="p-6">Loading your quizzes...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Quiz History</h1>

      {quizzes.length === 0 ? (
        <p className="text-gray-600">You haven't generated any quizzes yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="border rounded-lg p-4 bg-white shadow">
              <h3 className="font-semibold text-lg">{quiz.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(quiz.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                className="mt-3 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
              >
                View Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}