import React, { useState } from 'react';
import { PlaySquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_OPTIONS = [
  'Machine Learning Engineer',
  'Software Engineer',
  'Front-end Engineer',
  'Back-end Engineer',
];

const ROLE_DESCRIPTIONS = {
  'Machine Learning Engineer': 'Focused on model design, evaluation, and production-grade ML systems.',
  'Software Engineer': 'Focused on scalable systems, clean architecture, and backend/frontend integration.',
  'Front-end Engineer': 'Focused on UI, accessibility, client-side performance, and modern JavaScript frameworks.',
  'Back-end Engineer': 'Focused on API design, databases, scalability, and secure server-side systems.',
};

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const [resumeFile, setResumeFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResumeChange = (event) => {
    const file = event.target.files[0];
    setResumeFile(file || null);
  };

  const handleStartInterview = async () => {
    if (!resumeFile) {
      setStatusMessage('Please upload your resume before starting the interview.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Preparing your interview.');

    try {
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('role', selectedRole);

      const response = await fetch('http://localhost:8001/api/start-interview', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to start interview.');
      }

      const safeState = {
        role: data.selected_role || selectedRole,
        resumeName: data.resume_filename || resumeFile.name,
        initialReply: data.reply,
        initialAudio: data.audio_data,
      };

      sessionStorage.setItem('prepifyInterviewSetup', JSON.stringify(safeState));
      setStatusMessage('Interview setup complete. Redirecting to your session...');

      navigate('/interview/session', { state: safeState });
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || 'Unable to start the interview.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 px-6 py-8 sm:px-10 sm:py-10">
          <div>
            <div className="mb-6">
              <h1 className="text-5xl font-bold text-slate-900">Interview Setup</h1>
              <p className="mt-4 text-gray-600 max-w-2xl leading-8 text-lg">
                Upload your resume and choose the role you want to be interviewed for. The AI interviewer will use this information to create a role-specific interview experience.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Target role</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-3 w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-3 text-sm text-slate-600">{ROLE_DESCRIPTIONS[selectedRole]}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <span className="text-sm font-semibold text-slate-700 block mb-3">Resume upload</span>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <span className={`inline-block rounded-2xl border-2 px-6 py-3 text-sm font-medium cursor-pointer transition ${
                    resumeFile
                      ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}>
                    {resumeFile ? `✓ ${resumeFile.name}` : 'Choose PDF file'}
                  </span>
                </label>
                <p className="mt-3 text-sm text-slate-600">Upload a PDF resume so the interviewer can tailor questions to your experience.</p>
              </div>

              {statusMessage && (
                <div className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  {statusMessage}
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 text-white shadow-xl">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Role insights</p>
              <h2 className="mt-4 text-3xl font-semibold">{selectedRole}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">The AI will use your uploaded resume and this selected role to ask questions that closely match the target job and your experience.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-300">Step 1</p>
                <p className="mt-2 text-base font-semibold">Upload a valid PDF resume</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-300">Step 2</p>
                <p className="mt-2 text-base font-semibold">Choose the role you want to practice</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-300">Step 3</p>
                <p className="mt-2 text-base font-semibold">Start the interview and speak naturally</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={isLoading}
              className="mt-8 w-full rounded-full bg-blue-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              {isLoading ? 'Launching interview...' : 'Start Interview'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
