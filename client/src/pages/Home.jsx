import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Zap, Target, Users, TrendingUp } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Feedback",
      description: "Get intelligent, real-time feedback on your answers with detailed explanations and improvement tips.",
    },
    {
      icon: Target,
      title: "Personalized Practice",
      description: "Tailored interview questions based on your target role, industry, and skill level.",
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Real-time performance metrics, speech analysis, and confidence scoring after each practice session.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your improvement over time with detailed analytics and performance benchmarks.",
    },
    {
      icon: Users,
      title: "Diverse Questions",
      description: "Access thousands of questions from top tech companies and various industries.",
    },
    {
      icon: Sparkles,
      title: "Interview Ready",
      description: "Build confidence with realistic mock interviews that simulate actual job interview conditions.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Students Trained" },
    { value: "95%", label: "Success Rate" },
    { value: "500+", label: "Interview Questions" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-orange-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-orange-600">
              Prepify
            </span>
          </div>
          <button
            onClick={() => navigate("/authentication")}
            className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all duration-300 shadow-md hover:shadow-orange-300"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-orange-100 border border-orange-300 rounded-full">
                <span className="text-sm font-semibold text-orange-700">✨ AI-Powered Interview Mastery</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Master Interviews with{" "}
                <span className="text-orange-600">
                  Prepify AI
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                Practice with AI-powered mock interviews, get real-time feedback, and land your dream job. Built for students and job seekers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate("/interview")}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-orange-400 text-center"
              >
                Start Practicing Now
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 border-2 border-gray-300 hover:border-orange-300 text-gray-900 font-semibold rounded-lg transition-all duration-300 bg-gray-50 hover:bg-orange-50 text-center"
              >
                View Dashboard
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-2xl font-bold text-orange-600">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Visual Card */}
          <div className="relative h-96 hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-300 backdrop-blur-sm p-8 flex flex-col justify-center items-center space-y-6 shadow-lg">
              <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center">AI Interview Coach</h3>
              <p className="text-gray-700 text-center text-sm">
                Real-time feedback powered by advanced AI technology
              </p>
              <div className="w-full h-1 bg-orange-600 rounded-full"></div>
              <p className="text-xs text-gray-600">Ready to transform your interview skills?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-orange-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Why Choose <span className="text-orange-600">Prepify</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to ace your interviews and stand out from the competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white border border-orange-200 hover:border-orange-400 rounded-xl p-8 transition-all duration-300 hover:shadow-lg shadow-sm"
                >
                  <div className="absolute inset-0 bg-orange-50/0 group-hover:bg-orange-50/50 rounded-xl transition-all duration-300"></div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-300 rounded-2xl p-12 sm:p-16 text-center space-y-8 overflow-hidden shadow-lg">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl -z-10"></div>

            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Join thousands of students and job seekers who are already preparing with Prepify
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate("/interview")}
                className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-orange-400 text-lg"
              >
                Start Free Practice
              </button>
              <button
                onClick={() => navigate("/authentication")}
                className="px-10 py-4 border-2 border-orange-400 hover:border-orange-500 text-gray-900 font-bold rounded-lg transition-all duration-300 bg-white hover:bg-orange-50 text-lg"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-200 py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-gray-600 text-sm">
          <p>&copy; 2026 Prepify. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
