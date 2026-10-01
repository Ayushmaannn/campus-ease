import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBrain,
  FaChartLine,
  FaRobot,
  FaLightbulb,
  FaExclamationTriangle,
  FaArrowUp,
  FaUsers,
  FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const AIAnalytics = ({ userRole = 'student' }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
  }, [userRole, user]);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { "Authorization": `Bearer ${token}` };

      if (userRole === 'student' && user?.id) {
        // Fetch real student risk & performance
        const riskRes = await fetch(`${API}/analytics/student/${user.id}/risk`, { headers });
        const perfRes = await fetch(`${API}/analytics/student/${user.id}/performance`, { headers });
        
        const riskData = riskRes.ok ? await riskRes.json() : null;
        const perfData = perfRes.ok ? await perfRes.json() : null;

        const studentInsights = [];
        
        if (riskData) {
          studentInsights.push({
            type: 'attendance',
            title: 'Risk Alert',
            message: `Risk Level: ${riskData.risk_level.toUpperCase()}. ${riskData.factors.join(', ')}`,
            confidence: 90,
            icon: riskData.risk_level === 'high' ? <FaExclamationTriangle /> : <FaLightbulb />,
            color: riskData.risk_level === 'high' ? 'text-red-600' : 'text-blue-600',
            bgColor: riskData.risk_level === 'high' ? 'bg-red-50' : 'bg-blue-50'
          });
        }

        if (perfData && perfData.trend.length > 0) {
          const lastSem = perfData.trend[perfData.trend.length - 1];
          studentInsights.push({
            type: 'performance',
            title: 'Performance Snapshot',
            message: `Last Semester SGPA: ${lastSem.sgpa}, Attendance: ${lastSem.attendance_pct}%`,
            confidence: 95,
            icon: <FaChartLine />,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          });
        }
        
        setInsights(studentInsights.length > 0 ? studentInsights : [{
            type: 'performance',
            title: 'Performance Prediction',
            message: 'Based on current trends, keep working hard to maintain good grades.',
            confidence: 85,
            icon: <FaArrowUp />,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        }]);

        setPredictions([
          { metric: 'Current CGPA', predicted: riskData?.cgpa?.toFixed(2) || 'N/A', current: riskData?.cgpa?.toFixed(2) || 'N/A' },
          { metric: 'Risk Score', predicted: riskData?.risk_score || 0, current: riskData?.risk_score || 0 },
        ]);
      } else if (userRole === 'admin') {
        const adminOverviewRes = await fetch(`${API}/analytics/admin/overview`, { headers });
        const adminOverview = adminOverviewRes.ok ? await adminOverviewRes.json() : null;
        
        if (adminOverview) {
           setInsights([{
            type: 'enrollment',
            title: 'Admissions Pipeline',
            message: `Currently ${adminOverview.pending_admissions} pending applications.`,
            confidence: 98,
            icon: <FaUsers />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaBrain className="text-purple-600 text-2xl animate-pulse" />
          <h3 className="text-xl font-bold text-gray-800">AI Analytics Processing...</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBrain className="text-purple-600 text-2xl" />
        <h3 className="text-xl font-bold text-gray-800">AI-Powered Insights</h3>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
          BETA
        </span>
      </div>

      {/* AI Insights */}
      <div className="space-y-4 mb-6">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`${insight.bgColor} rounded-lg p-4 border-l-4 border-purple-500`}
          >
            <div className="flex items-start gap-3">
              <div className={`${insight.color} text-xl mt-1`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
                <p className="text-gray-700 text-sm mb-2">{insight.message}</p>
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded-full px-2 py-1">
                    <span className="text-xs font-medium text-gray-600">
                      Confidence: {insight.confidence}%
                    </span>
                  </div>
                  <FaRobot className="text-purple-500 text-sm" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Predictions */}
      {userRole === 'student' && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaGraduationCap className="text-blue-600" />
            AI Predictions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {predictions.map((pred, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">{pred.metric}</p>
                <p className="font-bold text-lg text-blue-600">{pred.predicted}</p>
                <p className="text-xs text-gray-500">Current: {pred.current}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalytics;