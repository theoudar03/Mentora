import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchWelfareDashboard } from '../../api/welfareApi';
import WelfareSummaryCard from '../../components/cards/WelfareSummaryCard';
import DepartmentStressChart from '../../components/charts/DepartmentStressChart';
import RiskDistributionPie from '../../components/charts/RiskDistributionPie';
import HighRiskStudentsTable from '../../components/tables/HighRiskStudentsTable';
import WelfareInsightPanel from '../../components/cards/WelfareInsightPanel';
import WelfareAlerts from '../../components/cards/WelfareAlerts';
import { Activity, ShieldAlert, HeartPulse, TrendingUp } from 'lucide-react';

const WelfareDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWelfareDashboard();
        setData(response.data);
      } catch (err) {
        console.error('Failed to load welfare dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  const { summary, departmentStress, riskDistribution, highRiskStudents, alerts, aiInsight } = data;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Welfare Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor wellbeing trends and coordinate early student support.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Welfare Member'}</p>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium inline-block mt-1">
              Institutional Monitoring
            </span>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold text-xl">
            {user?.name?.charAt(0) || 'W'}
          </div>
        </div>
      </div>

      {/* Row 1: Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <WelfareSummaryCard 
          title="Monitored Students" 
          count={summary.totalMonitored}
          icon={Activity}
          colorClass="bg-blue-50 text-blue-600"
        />
        <WelfareSummaryCard 
          title="High Risk Alerts" 
          count={summary.highRisk}
          icon={ShieldAlert}
          colorClass="bg-red-50 text-red-600"
        />
        <WelfareSummaryCard 
          title="Medium Risk Status" 
          count={summary.mediumRisk}
          icon={HeartPulse}
          colorClass="bg-yellow-50 text-yellow-600"
        />
        <WelfareSummaryCard 
          title="Campus Improvement" 
          count={summary.weeklyImprovement}
          icon={TrendingUp}
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      {/* AI Insight Row */}
      <WelfareInsightPanel message={aiInsight || "Analyzing wellness metrics..."} />

      {/* Row 2: Charts (Grid 3 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-h-[350px]">
          <DepartmentStressChart data={departmentStress} />
        </div>
        <div className="xl:col-span-1 min-h-[350px]">
          <RiskDistributionPie data={riskDistribution} />
        </div>
      </div>

      {/* Row 3: Table and Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <HighRiskStudentsTable students={highRiskStudents} />
        </div>
        <div className="xl:col-span-1 min-h-[400px]">
          <WelfareAlerts alerts={alerts} />
        </div>
      </div>

    </div>
  );
};

export default WelfareDashboard;
