import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/apiClient';
import StatusBadge from '../ui/StatusBadge';

const StudentReviewDrawer = ({ studentId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !studentId) return;
    
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(`/mentor/student/${studentId}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch student details", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
    
    // Prevent background scrolling when open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const renderRiskBar = (label, score, inverse = false) => {
    // Determine color scale. If inverse, high score is good (green). Otherwise high is bad (red)
    const normalizedScore = Math.max(0, Math.min(100, score * 20)); // Converting 1-5 scale to 0-100% roughly
    let colorClass = 'bg-indigo-500';
    
    if (!inverse) {
      if (score >= 4) colorClass = 'bg-red-500';
      else if (score >= 3) colorClass = 'bg-yellow-500';
      else colorClass = 'bg-green-500';
    } else {
      if (score >= 4) colorClass = 'bg-green-500';
      else if (score >= 3) colorClass = 'bg-yellow-500';
      else colorClass = 'bg-red-500';
    }

    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
          <span>{label}</span>
          <span>{score}/5</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className={`${colorClass} h-full rounded-full`} style={{ width: `${normalizedScore}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto flex flex-col`}>
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-900">Student Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
              <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
              <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
            </div>
          ) : !data ? (
            <div className="text-center text-gray-500 py-10">
              Failed to load profile.
            </div>
          ) : (
            <>
              {/* Bio Grid Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{data.bio.name}</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Department</span>
                    <span className="font-medium text-gray-800">{data.bio.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Year</span>
                    <span className="font-medium text-gray-800">Year {data.bio.year_of_study}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">CGPA</span>
                    <span className="font-medium text-gray-800">{data.bio.cgpa}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Age / Gender</span>
                    <span className="font-medium text-gray-800">{data.bio.age} • {data.bio.gender}</span>
                  </div>
                </div>
              </div>

              {/* Main Risk Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 block">
                    Current Risk Score
                  </span>
                  <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                    {data.latestAssessment?.Mental_health_Risk_Status || 0}
                    <span className="text-sm font-medium text-gray-500">/ 100</span>
                  </div>
                </div>
                <div>
                  <StatusBadge level={data.latestAssessment?.Mental_health_Risk_Status > 65 ? 'High' : data.latestAssessment?.Mental_health_Risk_Status > 35 ? 'Medium' : 'Low'} />
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 shadow-sm">
                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">AI Insight</h4>
                  <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                    {data.aiInsight || "No specific insight generated yet."}
                  </p>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-4">Risk Trend (Last 4 Weeks)</h4>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.riskHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <XAxis dataKey="week" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Factor Breakdown */}
              {data.latestAssessment && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-4">Feature Breakdown</h4>
                  <div className="space-y-4">
                    {renderRiskBar("Perceived Stress", data.latestAssessment.perceived_stress_score)}
                    {renderRiskBar("Academic Pressure", data.latestAssessment.academic_pressure_score)}
                    {renderRiskBar("Sleep Quality", data.latestAssessment.sleep_quality_score, true)}
                    {renderRiskBar("Family Support", data.latestAssessment.family_support_score, true)}
                    {renderRiskBar("Loneliness", data.latestAssessment.loneliness_score)}
                  </div>
                  
                  {data.latestAssessment.other_discomfort && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Reported Discomfort
                      </span>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        "{data.latestAssessment.other_discomfort}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentReviewDrawer;
