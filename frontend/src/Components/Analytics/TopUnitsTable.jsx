import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

const TopUnitsTable = ({ units = [] }) => {
  if (!units || units.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-[#5B6859] text-sm">
        No unit performance data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#BDD2B6] text-left">
        <thead>
          <tr className="text-[11px] font-bold uppercase tracking-wider text-[#5B6859] bg-[#F8EDE3]">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Unit Call Sign</th>
            <th className="py-3 px-4">Completed Tasks</th>
            <th className="py-3 px-4">Avg Completion Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#BDD2B6]/50 text-sm">
          {units.map((unit, index) => (
            <tr key={unit.vehicleId || index} className="hover:bg-[#F8EDE3]/40 transition-colors">
              <td className="py-3.5 px-4 font-mono">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-[#BDD2B6] text-[#283227] border border-[#A2B29F]' :
                  index === 1 ? 'bg-[#BDD2B6]/60 text-[#283227] border border-[#BDD2B6]' :
                  index === 2 ? 'bg-[#F8EDE3] text-[#5B6859] border border-[#BDD2B6]' :
                  'text-[#5B6859]'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-3.5 px-4 font-semibold text-[#283227] flex items-center gap-2">
                {unit.registrationNumber || `Unit #${unit.vehicleId}`}
              </td>
              <td className="py-3.5 px-4 text-[#283227]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#BDD2B6]/40 text-[#283227] border border-[#A2B29F]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#798777]" />
                  {unit.tasksCompleted || 0}
                </span>
              </td>
              <td className="py-3.5 px-4 font-mono text-[#5B6859]">
                {unit.averageJobCompletionTimeMinutes != null
                  ? `${Number(unit.averageJobCompletionTimeMinutes).toFixed(1)} min`
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopUnitsTable;
