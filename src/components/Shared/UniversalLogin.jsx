import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserTie,
  FaUsers,
  FaShieldAlt,
  FaArrowLeft
} from 'react-icons/fa';

const UniversalLogin = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'student', name: 'Student', icon: <FaUserGraduate />, color: 'bg-blue-500' },
    { id: 'faculty', name: 'Faculty', icon: <FaChalkboardTeacher />, color: 'bg-green-500' },
    { id: 'admin', name: 'Admin', icon: <FaUserTie />, color: 'bg-purple-500' },
    { id: 'parent', name: 'Parent', icon: <FaUsers />, color: 'bg-orange-500' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          role: selectedRole
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Pass both user data and tokens to context
        login({
          ...data.user,
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
        
        // Save tokens in localStorage (AuthContext usually handles user, but let's just make sure)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Navigate to appropriate dashboard
        switch (selectedRole) {
          case 'student': navigate('/student'); break;
          case 'faculty': navigate('/faculty'); break;
          case 'admin': navigate('/admin'); break;
          case 'parent': navigate('/parent'); break;
          default: navigate('/');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.detail || `Invalid credentials for ${selectedRole}.`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Back Button */}
        <div className="mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft />
            <span className="text-sm">Back to Home</span>
          </motion.button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaShieldAlt className="text-3xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">QuickCampus ERP</h1>
          </div>
          <p className="text-gray-600">Secure Login Portal</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Role</label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 ${role.color} rounded-full flex items-center justify-center text-white mb-2 mx-auto`}>
                  {role.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{role.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Student:</strong> student / student123</p>
            <p><strong>Faculty:</strong> faculty / faculty123</p>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Parent:</strong> parent / parent123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure login powered by advanced encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UniversalLogin;