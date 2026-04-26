import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [role, setRole] = useState('Interview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedState = sessionStorage.getItem('prepify_feedback');
    const persisted = savedState ? JSON.parse(savedState) : null;

    if (location.state?.feedback) {
      console.log('Feedback from navigation state:', location.state.feedback);
      setFeedback(location.state.feedback);
      setRole(location.state.role || 'Interview');
      sessionStorage.setItem(
        'prepify_feedback',
        JSON.stringify({ feedback: location.state.feedback, role: location.state.role || 'Interview' })
      );
    } else if (persisted?.feedback) {
      console.log('Feedback from sessionStorage:', persisted.feedback);
      setFeedback(persisted.feedback);
      setRole(persisted.role || 'Interview');
    } else {
      console.warn('No feedback found in state or sessionStorage');
    }
    setLoading(false);
  }, [location.state]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
        <p className="mt-4 text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
        <p className="mt-4 text-gray-600">We could not load the feedback for this interview.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  const questions = Array.isArray(feedback.question_feedback) ? feedback.question_feedback : [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Overall Results Card */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Feedback</h1>
            <p className="text-sm text-gray-500 mt-2">Role: <span className="font-medium">{role}</span></p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-6 text-white shadow-lg">
            <p className="text-xs uppercase tracking-widest font-semibold text-blue-100">Overall Rating</p>
            <p className="mt-3 text-5xl font-bold">{feedback.overall_rating ?? 'N/A'}<span className="text-2xl">/10</span></p>
          </div>
        </div>
        {feedback.overall_comments && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-700 leading-relaxed">{feedback.overall_comments}</p>
          </div>
        )}
      </div>

      {/* Question-wise Feedback */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Question-Wise Breakdown</h2>
          {questions.map((item, index) => (
            <section key={index} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 whitespace-nowrap">
                  {item.rating ?? 'N/A'}/10
                </span>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-800 mb-1">Question</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{item.question || 'No question text available.'}</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold text-gray-800 mb-1">Your Answer</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{item.your_answer || 'No answer recorded.'}</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <p className="font-semibold text-gray-800 mb-1">Model Response</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{item.expected_answer || 'No expected answer provided.'}</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold text-gray-800 mb-1">Improvements</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{item.improvements || 'No improvement advice available.'}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Detailed question feedback is not available for this session.</p>
        </div>
      )}

      {/* Raw Output (if parsing failed) */}
      {feedback.raw_text && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 text-sm text-orange-900 shadow-sm">
          <h3 className="font-semibold mb-3">⚠️ Raw Feedback Output</h3>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs">{feedback.raw_text}</pre>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 rounded-full bg-gray-600 hover:bg-gray-700 px-6 py-3 text-white font-medium transition-colors"
        >
          Return to Dashboard
        </button>
        <button
          onClick={() => navigate('/interview')}
          className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-medium transition-colors"
        >
          Start Another Interview
        </button>
      </div>
    </div>
  );
};

export default Feedback;