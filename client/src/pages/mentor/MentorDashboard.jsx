import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchMentorDashboard } from '../../api/mentorApi';
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

  useEffect(() => {
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
    loadDashboardData();
  }, []);

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
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex min-h-[400px]">
          {/* Main Chart */}
          <RiskTrendChart data={trendData} />
        </div>
        <div className="lg:col-span-1 flex min-h-[400px]">
          {/* Side Panel */}
          <RecentAlerts alerts={alerts} />
        </div>
      </div>

      {/* Row 3: Main Table */}
      <div className="w-full">
        <StudentRiskTable students={students} />
      </div>

    </div>
  );
};

export default MentorDashboard;
