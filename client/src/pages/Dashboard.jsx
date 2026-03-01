import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, ChevronDown, Zap, Target, TrendingUp, Clock, Award, BarChart3, Play, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const mockUserData = {
    name: "John Doe",
    targetRole: "Senior Software Engineer",
    experienceLevel: "Mid-level",
    email: "john@example.com",
  };

  const mockStats = {
    totalInterviews: 12,
    averageScore: 78,
    strengthAreas: ["Problem Solving", "Communication"],
    improvementAreas: ["System Design", "Behavioral Questions"],
    lastInterviewDate: "Jan 15, 2025",
    lastScore: 82,
    feedbackSummary: "Great technical depth. Work on explaining thought process more clearly.",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white border-b border-neutral-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">Prepify</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {mockUserData.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-neutral-700 hidden sm:block">{mockUserData.name}</span>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>

            {profileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-2">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900">{mockUserData.name}</p>
                  <p className="text-xs text-neutral-500">{mockUserData.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                  Welcome back, {mockUserData.name.split(" ")[0]}
                </h1>
                <p className="text-lg text-neutral-600 mb-1">
                  Target Role: <span className="font-semibold text-orange-600">{mockUserData.targetRole}</span>
                </p>
                <p className="text-neutral-600">
                  You're on the right path. Every interview brings you closer to your goal.
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-3xl font-bold text-orange-600">{mockStats.totalInterviews}</p>
                <p className="text-sm text-neutral-600">Interviews Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button className="group bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
              <Play className="w-6 h-6 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2 text-left">Start Mock Interview</h3>
            <p className="text-sm text-neutral-600 text-left">Begin a full mock interview session</p>
          </button>

          <button className="group bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2 text-left">Resume-Based Interview</h3>
            <p className="text-sm text-neutral-600 text-left">Answer questions about your background</p>
          </button>

          <button className="group bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <Target className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2 text-left">Practice by Role</h3>
            <p className="text-sm text-neutral-600 text-left">Role-specific questions and feedback</p>
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-neutral-600">Average Score</h4>
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{mockStats.averageScore}%</p>
            <p className="text-xs text-neutral-500 mt-2">Across all interviews</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-neutral-600">Total Interviews</h4>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{mockStats.totalInterviews}</p>
            <p className="text-xs text-neutral-500 mt-2">Practice sessions</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-neutral-600">Last Interview</h4>
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{mockStats.lastScore}%</p>
            <p className="text-xs text-neutral-500 mt-2">{mockStats.lastInterviewDate}</p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-neutral-600">Improvement</h4>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">+4%</p>
            <p className="text-xs text-neutral-500 mt-2">From last month</p>
          </div>
        </section>

        {/* Strengths & Improvements */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Strength Areas</h3>
            </div>
            <div className="space-y-3">
              {mockStats.strengthAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-neutral-900">{area}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Areas to Improve</h3>
            </div>
            <div className="space-y-3">
              {mockStats.improvementAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-neutral-900">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm mb-12">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Last Interview Feedback</h3>
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">Technical Assessment</p>
                <p className="text-xs text-neutral-600 mt-1">{mockStats.lastInterviewDate}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{mockStats.lastScore}%</p>
              </div>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full mb-4">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${mockStats.lastScore}%` }}></div>
            </div>
            <p className="text-sm text-neutral-700">{mockStats.feedbackSummary}</p>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl p-6 transition-colors duration-300 shadow-md hover:shadow-lg">
            <div className="flex items-center gap-3 justify-center">
              <Play className="w-5 h-5" />
              <span className="text-lg font-semibold">Continue Practice</span>
            </div>
            <p className="text-orange-100 text-sm mt-2 text-center">Resume your last interview session</p>
          </button>

          <button className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 rounded-xl p-6 transition-colors duration-300">
            <div className="flex items-center gap-3 justify-center">
              <BarChart3 className="w-5 h-5" />
              <span className="text-lg font-semibold">View Detailed Feedback</span>
            </div>
            <p className="text-neutral-600 text-sm mt-2 text-center">Analyze your performance metrics</p>
          </button>
        </section>
      </main>
    </div>
  );
}
