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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Student Risk Overview</h2>
        <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">
          {students.length} Monitored
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="min-w-full text-sm text-left align-middle border-collapse">
          <thead className="bg-gray-50/80 sticky top-0 border-b border-gray-100 z-10">
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
                  <span className="font-medium text-gray-900">{student.name}</span>
                </td>
                <td className="px-5 py-4 text-gray-600">{student.department}</td>
                <td className="px-5 py-4">
                  <span className="text-gray-600 font-medium">{student.surveyScore}</span>
                </td>
                <td className="px-5 py-4 w-32">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${student.surveyScore}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge level={student.riskLevel} />
                </td>
                <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">
                  {student.lastCheckIn}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2 py-1 rounded inline-block text-sm ${student.timeTaken < 30 ? 'bg-yellow-100 text-yellow-800 font-medium' : 'text-gray-600'}`}>
                    {student.timeTaken || '-'}s
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button 
                    onClick={() => handleOpenDrawer(student.id)}
                    className="text-indigo-600 font-medium hover:underline p-2 rounded-lg transition-colors inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Review Student &rarr;
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
