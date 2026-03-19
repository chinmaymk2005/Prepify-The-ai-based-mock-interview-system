import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Sparkles, Eye, EyeOff, TrendingUp, BriefcaseBusiness } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Auth() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        targetRole: "",
        experienceLevel: "",
        password: "",
        confirmPassword: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(""); // Clear error on input change
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!formData.email.includes("@")) {
            setError("Enter a valid email");
            return false;
        }
        if (!formData.password.trim()) {
            setError("Password is required");
            return false;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }
        if (!isLogin) {
            if (!formData.name.trim()) {
                setError("Name is required");
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/signup";
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    name: formData.name,    
                    email: formData.email,
                    targetRole: formData.targetRole,
                    experienceLevel: formData.experienceLevel,
                    password: formData.password,
                };

            const response = await fetch(`http://localhost:3000/api${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",                    
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token);
                // Reset form
                setFormData({ name: "", email: "", password: "", confirmPassword: "", targetRole: "", experienceLevel: "" });
                // Redirect to dashboard only on success
                navigate("/dashboard");
            } else {
                setError(data.message || "Authentication failed");
            }
        } catch (err) {
            setError("Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white flex items-center justify-center px-4 py-12">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl -z-10"></div>

            <div className="w-full max-w-md">
                {/* Header - Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-orange-600">Prepify</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Master interviews with AI-powered practice
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 hover:cursor-pointer py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${isLogin
                                ? "bg-orange-600 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-lg hover:cursor-pointer font-semibold transition-all duration-300 ${!isLogin
                                ? "bg-orange-600 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field - Only for Sign Up */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                />
                            </div>
                        </div>

                        {/* Target Role Field - Only for Sign Up */}
                        {!isLogin && (<div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Role
                            </label>
                            <div className="relative">
                                <BriefcaseBusiness className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <select
                                    type="dropdown"
                                    name="targetRole"
                                    value={formData.targetRole}
                                    onChange={handleInputChange}
                                    placeholder="Software Engineer, Data Scientist, etc."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                >
                                    <option value="">Select target Interview</option>
                                    <option value="Software Engineer">Software Engineer</option>                                    
                                    <option value="Software Developer">Software Developer</option>                                    
                                    <option value="chartered accountant">chartered accountant (CA) </option>                                    
                                    <option value="UPSC / MPSC">UPSC / MPSC</option>                                                                        
                                    <option value="CEO">CEO</option>                                                                                                            
                                    <option value="Product Manager">Product Manager</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        )}

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Experience Level
                                </label>

                                <div className="relative">
                                    <TrendingUp className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

                                    <select
                                        name="experienceLevel" 
                                        value={formData.experienceLevel}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    >
                                        <option value="">Select experience level</option>
                                        <option value="Fresher">Fresher (0 years)</option>
                                        <option value="Junior">Junior (0–2 years)</option>
                                        <option value="Mid-Level">Mid-Level (2–5 years)</option>
                                        <option value="Senior">Senior (5+ years)</option>
                                        <option value="Career Switcher">Career Switcher</option>
                                    </select>
                                </div>
                            </div>
                        )}


                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password - Only for Sign Up */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Forgot Password - Only for Login */}
                        {isLogin && (
                            <div className="text-right">
                                <a href="#" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 hover:cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : isLogin ? (
                                "Login to Prepify"
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-500">OR</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Google Auth Button */}
                    <button onClick={() => window.open("https://accounts.google.com", "_blank")} className="w-full hover:cursor-pointer py-2.5 border-2 border-gray-300 hover:border-orange-300 text-gray-700 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-orange-50">                                                
                        Continue with Google
                    </button>

                    {/* Footer Text */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-orange-600 hover:cursor-pointer hover:text-orange-700 font-semibold"
                        >
                            {isLogin ? "Sign up" : "Login"}
                        </button>
                    </p>
                </div>

                {/* Security Note */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    🔒 Your data is encrypted and secure
                </p>
            </div>
        </div>
    );
}
