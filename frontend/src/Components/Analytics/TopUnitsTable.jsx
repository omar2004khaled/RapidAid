import React from 'react';

const TopUnitsTable = ({ units = [] }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Completion Time (min)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {units && units.length > 0 ? (
                        units.map((unit, index) => (
                            <tr key={unit.vehicleId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.registrationNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.tasksCompleted}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.averageJobCompletionTimeMinutes ? unit.averageJobCompletionTimeMinutes.toFixed(2) : 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TopUnitsTable;
