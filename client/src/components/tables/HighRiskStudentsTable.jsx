import React from 'react';

const HighRiskStudentsTable = ({ students }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Critical High-Risk Interventions</h2>
        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium border border-red-100">
          Action Required
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="min-w-full text-sm text-left align-middle border-collapse">
          <thead className="bg-gray-50/80 sticky top-0 border-b border-gray-100 z-10">
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
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No critical students currently recorded.
                </td>
              </tr>
            ) : students.map((student) => (
              <tr key={student.id} className="hover:bg-red-50/10 transition-colors bg-white">
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{student.name}</span>
                </td>
                <td className="px-5 py-4 text-gray-600">{student.department}</td>
                <td className="px-5 py-4">
                  <span className="text-red-700 font-bold bg-red-50 px-2 py-1 rounded inline-block">
                    {student.riskScore}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2 py-1 rounded inline-block text-xs font-medium uppercase tracking-wide
                    ${student.timeTaken < 30 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'text-gray-500 bg-gray-50'}`}>
                    {student.timeTaken}s
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                  {student.mentor}
                </td>
                <td className="px-5 py-4 text-center">
                  <button className="bg-white border border-gray-200 text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-200 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm shadow-sm">
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
