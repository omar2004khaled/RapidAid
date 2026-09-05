import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import analyticsAPI from '../services/analyticsAPI';
import ResponseTimeChart from '../Components/Analytics/ResponseTimeChart';
import TopUnitsTable from '../Components/Analytics/TopUnitsTable';
import Navbar from '../Components/Navbar';

const AnalyticsPage = ({ isEmbedded = false }) => {
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [topUnits, setTopUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, trendRes, unitsRes] = await Promise.all([
        analyticsAPI.getPerformanceMetrics().catch(() => null),
        analyticsAPI.getResponseTimeTrend(30).catch(() => []),
        analyticsAPI.getTopPerformingUnits(5).catch(() => [])
      ]);

      setMetrics(metricsRes);
      setTrendData(trendRes || []);
      setTopUnits(unitsRes || []);
      setError(null);
    } catch (err) {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const content = (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#283227] tracking-tight">
            Operational Analytics
          </h1>
          <p className="text-sm text-[#5B6859]">
            Emergency response performance indicators and unit reliability telemetry
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#BDD2B6] text-xs font-semibold text-[#5B6859] hover:text-[#283227] hover:bg-[#BDD2B6]/20 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-md space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#5B6859] uppercase tracking-wider">Avg Response Time</span>
            <div className="p-2.5 rounded-xl bg-[#BDD2B6]/40 text-[#798777] border border-[#A2B29F]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#283227] font-mono">
            {metrics?.averageResponseTimeMinutes != null
              ? `${Number(metrics.averageResponseTimeMinutes).toFixed(1)}m`
              : 'N/A'}
          </div>
          <p className="text-xs text-[#5B6859] font-medium">Incident dispatch to acknowledgment</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-md space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#5B6859] uppercase tracking-wider">Avg Arrival Time</span>
            <div className="p-2.5 rounded-xl bg-[#BDD2B6]/40 text-[#798777] border border-[#A2B29F]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#283227] font-mono">
            {metrics?.averageArrivalTimeMinutes != null
              ? `${Number(metrics.averageArrivalTimeMinutes).toFixed(1)}m`
              : 'N/A'}
          </div>
          <p className="text-xs text-[#5B6859] font-medium">En route transit time to scene</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-md space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#5B6859] uppercase tracking-wider">Avg Resolution Time</span>
            <div className="p-2.5 rounded-xl bg-[#BDD2B6]/40 text-[#798777] border border-[#A2B29F]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#283227] font-mono">
            {metrics?.averageResolutionTimeMinutes != null
              ? `${Number(metrics.averageResolutionTimeMinutes).toFixed(1)}m`
              : 'N/A'}
          </div>
          <p className="text-xs text-[#5B6859] font-medium">Full incident duration to close</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-md space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#5B6859] uppercase tracking-wider">Resolved Incidents</span>
            <div className="p-2.5 rounded-xl bg-[#BDD2B6]/40 text-[#798777] border border-[#A2B29F]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#283227] font-mono">
            {metrics?.totalIncidentsResolved != null ? metrics.totalIncidentsResolved : '0'}
          </div>
          <p className="text-xs text-[#5B6859] font-medium">Total emergencies completed</p>
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#283227]">
              Response Time Trend (30 Days)
            </h2>
            <p className="text-xs text-[#5B6859]">Average response latency over calendar days</p>
          </div>
          <ResponseTimeChart data={trendData} />
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#283227]">
              Top Performing Response Units
            </h2>
            <p className="text-xs text-[#5B6859]">Vehicles with highest task throughput and efficiency</p>
          </div>
          <TopUnitsTable units={topUnits} />
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#F8EDE3] text-[#283227]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {content}
      </main>
    </div>
  );
};

export default AnalyticsPage;
