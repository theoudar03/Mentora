import React from 'react';

const HighRiskStudentsTable = ({ students }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Critical High-Risk Interventions</h2>
        <span className="text-xs text-rose-600 bg-rose-50 px-3 py-1 rounded-full font-bold tracking-wider uppercase border border-rose-100/50">
          Action Required
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="min-w-full text-sm text-left align-middle border-collapse">
          <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-100 z-10 backdrop-blur-md">
            <tr>
              <th className="px-5 py-4 font-semibold text-gray-600">Student Name</th>
              <th className="px-5 py-4 font-semibold text-gray-600">Department</th>
              <th className="px-5 py-4 font-semibold text-gray-600">Risk Score</th>
              <th className="px-5 py-4 font-semibold text-gray-600 text-center">Time Taken</th>
              <th className="px-5 py-4 font-semibold text-gray-600 hidden md:table-cell">Assigned Mentor</th>
              <th className="px-5 py-4 font-semibold text-center text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                  No critical students currently recorded.
                </td>
              </tr>
            ) : students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-semibold text-slate-900">{student.name}</span>
                </td>
                <td className="px-5 py-4 text-slate-500 font-medium">{student.department}</td>
                <td className="px-5 py-4">
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded-md inline-block">
                    {student.riskScore}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2 py-1 rounded-md inline-block text-xs font-bold uppercase tracking-wider
                    ${student.timeTaken < 30 ? 'bg-amber-100 text-amber-800 border-none' : 'text-slate-400 bg-slate-50'}`}>
                    {student.timeTaken}s
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-400 font-medium hidden md:table-cell">
                  {student.mentor}
                </td>
                <td className="px-5 py-4 text-center">
                  <button className="text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all inline-flex items-center justify-center whitespace-nowrap border border-transparent hover:border-indigo-100">
                    Send Support &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HighRiskStudentsTable;
