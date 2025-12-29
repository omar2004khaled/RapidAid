import React, { useEffect, useState } from 'react';
import analyticsAPI from '../services/analyticsAPI';
import ResponseTimeChart from '../Components/Analytics/ResponseTimeChart';
import TopUnitsTable from '../Components/Analytics/TopUnitsTable';

const AnalyticsPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [topUnits, setTopUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, trendRes, unitsRes] = await Promise.all([
                    analyticsAPI.getPerformanceMetrics(),
                    analyticsAPI.getResponseTimeTrend(30),
                    analyticsAPI.getTopPerformingUnits(5)
                ]);

                setMetrics(metricsRes);
                setTrendData(metricsRes ? trendRes : []);
                setTopUnits(unitsRes);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load analytics data", err);
                setError("Failed to load analytics data.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Analytics Dashboard</h1>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Avg Response Time" value={`${metrics?.averageResponseTimeMinutes?.toFixed(2)} min`} />
                <MetricCard title="Avg Arrival Time" value={`${metrics?.averageArrivalTimeMinutes?.toFixed(2)} min`} />
                <MetricCard title="Avg Resolution Time" value={`${metrics?.averageResolutionTimeMinutes?.toFixed(2)} min`} />
                <MetricCard title="Total Incidents Resolved" value={metrics?.totalIncidentsResolved} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Response Time Trend */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Response Time Trend (Last 30 Days)</h2>
                    <ResponseTimeChart data={trendData} />
                </div>

                {/* Top Performing Units */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Top Performing Units</h2>
                    <TopUnitsTable units={topUnits} />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
);

export default AnalyticsPage;
