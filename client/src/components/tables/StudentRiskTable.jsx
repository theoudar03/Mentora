import React, { useState } from 'react';
import StatusBadge from '../ui/StatusBadge';
import { Eye } from 'lucide-react';
import StudentReviewDrawer from '../mentor/StudentReviewDrawer';

const StudentRiskTable = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (id) => {
    setSelectedStudent(id);
    setDrawerOpen(true);
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Student Risk Overview</h2>
        <span className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-semibold tracking-wide">
          {students.length} Monitored
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="min-w-full text-sm text-left align-middle border-collapse">
          <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-100 z-10 backdrop-blur-md">
            <tr>
              <th className="px-5 py-4 font-semibold text-gray-600">Student Name</th>
              <th className="px-5 py-4 font-semibold text-gray-600">Department</th>
              <th className="px-5 py-4 font-semibold text-gray-600">Survey Score</th>
              <th className="px-5 py-4 font-semibold text-gray-600">Risk Intensity</th>
              <th className="px-5 py-4 font-semibold text-gray-600">Risk Level</th>
              <th className="px-5 py-4 font-semibold text-gray-600 hidden sm:table-cell">Last Check-in</th>
              <th className="px-5 py-4 font-semibold text-center text-gray-600">Time Taken (sec)</th>
              <th className="px-5 py-4 font-semibold text-center text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-semibold text-slate-900">{student.name}</span>
                </td>
                <td className="px-5 py-4 text-slate-500 font-medium">{student.department}</td>
                <td className="px-5 py-4">
                  <span className="text-slate-700 font-bold">
                    {typeof student.Mental_health_Risk_Status === 'number' 
                      ? student.Mental_health_Risk_Status 
                      : (student.surveyScore || 0)}
                  </span>
                </td>
                <td className="px-5 py-4 w-32">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${student.riskLevel === 'High' ? 'bg-rose-500' : student.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${student.Mental_health_Risk_Status || student.surveyScore || 0}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge level={student.riskLevel} />
                </td>
                <td className="px-5 py-4 text-slate-400 font-medium hidden sm:table-cell">
                  {student.lastCheckIn}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2 py-1 rounded-md inline-block text-xs uppercase tracking-wider font-bold ${student.timeTaken < 30 ? 'bg-amber-100 text-amber-800' : 'text-slate-400 bg-slate-50'}`}>
                    {student.timeTaken || '-'}s
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button 
                    onClick={() => handleOpenDrawer(student.id)}
                    className="text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all inline-flex items-center justify-center whitespace-nowrap border border-transparent hover:border-indigo-100"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render Drawer */}
      <StudentReviewDrawer 
        studentId={selectedStudent}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default StudentRiskTable;
