import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchMentorDashboard, addStudent } from '../../api/mentorApi';
import { mapMentorDashboardData } from '../../utils/dataMapper';
import RiskSummaryCard from '../../components/cards/RiskSummaryCard';
import RiskTrendChart from '../../components/charts/RiskTrendChart';
import StudentRiskTable from '../../components/tables/StudentRiskTable';
import RecentAlerts from '../../components/cards/RecentAlerts';
import RiskDistribution from '../../components/charts/RiskDistribution';
import AIInsightBanner from '../../components/cards/AIInsightBanner';

const MentorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    id_num: '', name: '', cgpa_score: '', attendance_score: '', fee_paid_late: ''
  });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMentorDashboard();
      const mappedData = mapMentorDashboardData(response.data);
      setDashboardData(mappedData);
    } catch (err) {
      setError('Unable to load wellbeing data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      await addStudent(addForm);
      setShowAddModal(false);
      setAddForm({ id_num: '', name: '', cgpa_score: '', attendance_score: '', fee_paid_late: '' });
      await loadDashboardData();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Error adding student');
    } finally {
      setIsAdding(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-100 text-center max-w-md">
          <p className="font-medium text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-white rounded-lg text-sm border border-red-200 hover:bg-gray-50 transition-colors inline-block"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded-2xl xl:col-span-1"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  const { riskSummary, students, alerts, trendData } = dashboardData;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor student wellbeing and provide early support</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add Student
          </button>
          
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Dr. Mentor'}</p>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium inline-block mt-1">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Mentor'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold text-xl">
            {user?.name?.charAt(0) || 'M'}
          </div>
        </div>
      </div>

      <AIInsightBanner />

      {/* Row 1: Summary Cards & Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <RiskSummaryCard 
            title="High Risk Students" 
            count={riskSummary.highRisk}
            trend={riskSummary.trends.highRisk}
            type="High"
          />
          <RiskSummaryCard 
            title="Medium Risk Students" 
            count={riskSummary.mediumRisk}
            trend={riskSummary.trends.mediumRisk}
            type="Medium"
          />
          <RiskSummaryCard 
            title="Stable Students" 
            count={riskSummary.stable}
            trend={riskSummary.trends.stable}
            type="Stable"
          />
        </div>
        <div className="xl:col-span-1">
          <RiskDistribution data={riskSummary} />
        </div>
      </div>

      {/* Row 2: Analytics & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 flex min-h-[300px] sm:min-h-[400px]">
          <RiskTrendChart data={trendData} />
        </div>
        <div className="lg:col-span-1 flex min-h-[300px] sm:min-h-[400px]">
          <RecentAlerts alerts={alerts} />
        </div>
      </div>

      {/* Row 3: Main Table */}
      <div className="w-full">
        <StudentRiskTable students={students} />
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              {addError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{addError}</div>}
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input type="text" required value={addForm.id_num} onChange={e => setAddForm({...addForm, id_num: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 8021" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Aditya Nair" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGPA (0-10)</label>
                    <input type="number" step="0.1" min="0" max="10" required value={addForm.cgpa_score} onChange={e => setAddForm({...addForm, cgpa_score: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" placeholder="8.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance %</label>
                    <input type="number" min="0" max="100" required value={addForm.attendance_score} onChange={e => setAddForm({...addForm, attendance_score: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" placeholder="85" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Paid Late (0 = No, 1 = Yes)</label>
                  <select required value={addForm.fee_paid_late} onChange={e => setAddForm({...addForm, fee_paid_late: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    <option value="" disabled>Select option...</option>
                    <option value="0">No (Paid on time)</option>
                    <option value="1">Yes (Paid late)</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-900 transition-colors">Cancel</button>
                  <button type="submit" disabled={isAdding} className={`px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl transition-colors ${isAdding ? 'opacity-70 cursor-wait' : 'hover:bg-indigo-700'}`}>
                    {isAdding ? 'Saving...' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorDashboard;
