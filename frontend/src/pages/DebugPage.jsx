import React, { useState, useEffect } from 'react';
import { Wrench, Database, Cpu, Route, CheckCircle, RefreshCw, Play, Trash2 } from 'lucide-react';
import Navbar from '../Components/Navbar';
import { useToast } from '../contexts/ToastContext';

const DebugPage = () => {
  const { showSuccess, showError } = useToast();
  const [dbVehicles, setDbVehicles] = useState(null);
  const [redisVehicles, setRedisVehicles] = useState(null);
  const [redisTest, setRedisTest] = useState(null);
  const [routingTest, setRoutingTest] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [vehicleRoutes, setVehicleRoutes] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDbVehicles = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/vehicles-db');
      setDbVehicles(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRedisVehicles = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/vehicles-redis');
      setRedisVehicles(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const testRedis = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/redis-test');
      setRedisTest(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const testRouting = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/test-routing');
      setRoutingTest(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const forceLoadRedis = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/force-load-redis', { method: 'POST' });
      const data = await res.json();
      showSuccess(`${data.message} (${data.loaded}/${data.total})`);
      fetchRedisVehicles();
    } catch (e) {
      showError('Failed to load vehicles into Redis');
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/assignments');
      setAssignments(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVehicleRoutes = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/vehicle-routes');
      setVehicleRoutes(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const processAssignments = async () => {
    try {
      const res = await fetch('http://localhost:8080/debug/process-assignments', { method: 'POST' });
      const data = await res.json();
      showSuccess(data.message);
      fetchAssignments();
      fetchVehicleRoutes();
    } catch (e) {
      showError('Failed to process assignments');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchDbVehicles(),
      fetchRedisVehicles(),
      testRedis(),
      testRouting(),
      fetchAssignments(),
      fetchVehicleRoutes()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8EDE3] text-[#283227]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#BDD2B6]/40 text-[#798777] border border-[#A2B29F]">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#283227]">System Telemetry & Diagnostics</h1>
              <p className="text-xs text-[#5B6859]">Low-level state inspect for MySQL, Redis cache, and GraphHopper routing engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#BDD2B6] text-xs font-semibold text-[#5B6859] hover:text-[#283227] hover:bg-[#BDD2B6]/20 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh All
            </button>
            <button
              onClick={forceLoadRedis}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#BDD2B6] hover:bg-[#a8c2a1] text-[#283227] border border-[#A2B29F] text-xs font-bold shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5" />
              Force Load Redis Cache
            </button>
            <button
              onClick={processAssignments}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#798777] hover:bg-[#687566] text-white text-xs font-bold shadow-md shadow-[#798777]/25"
            >
              <Play className="w-3.5 h-3.5" />
              Process Assignments
            </button>
          </div>
        </div>

        {/* Diagnostics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MySQL DB Vehicles */}
          <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#283227]">
                <Database className="w-4 h-4 text-[#798777]" />
                <span>Database Vehicles (MySQL)</span>
              </div>
              <button
                onClick={fetchDbVehicles}
                className="text-xs text-[#798777] hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>
            <pre className="p-3 bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] rounded-xl text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(dbVehicles, null, 2)}
            </pre>
          </div>

          {/* Redis Vehicles */}
          <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#283227]">
                <Cpu className="w-4 h-4 text-[#798777]" />
                <span>Redis Vehicle Cache (`vehicle:location:*`)</span>
              </div>
              <button
                onClick={fetchRedisVehicles}
                className="text-xs text-[#798777] hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>
            <pre className="p-3 bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] rounded-xl text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(redisVehicles, null, 2)}
            </pre>
          </div>

          {/* Redis Connectivity Test */}
          <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#283227]">
                <CheckCircle className="w-4 h-4 text-[#798777]" />
                <span>Redis Connection & Hash Test</span>
              </div>
              <button
                onClick={testRedis}
                className="text-xs text-[#798777] hover:underline font-semibold"
              >
                Test
              </button>
            </div>
            <pre className="p-3 bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] rounded-xl text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(redisTest, null, 2)}
            </pre>
          </div>

          {/* Routing Engine Test */}
          <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#283227]">
                <Route className="w-4 h-4 text-[#798777]" />
                <span>GraphHopper Routing Test (Cairo &rarr; Giza)</span>
              </div>
              <button
                onClick={testRouting}
                className="text-xs text-[#798777] hover:underline font-semibold"
              >
                Test
              </button>
            </div>
            <pre className="p-3 bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] rounded-xl text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(routingTest, null, 2)}
            </pre>
          </div>

          {/* Assignments */}
          <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#283227]">
                <span>Vehicle Assignments</span>
              </div>
              <button
                onClick={fetchAssignments}
                className="text-xs text-[#798777] hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>
            <pre className="p-3 bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] rounded-xl text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(assignments, null, 2)}
            </pre>
          </div>

          {/* Active Vehicle Routes */}
          <div className="p-5 rounded-3xl bg-white border border-[#BDD2B6] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#BDD2B6] pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#283227]">
                <span>Vehicle Live Routes (`vehicle:route:*`)</span>
              </div>
              <button
                onClick={fetchVehicleRoutes}
                className="text-xs text-[#798777] hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>
            <pre className="p-3 bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] rounded-xl text-xs font-mono max-h-64 overflow-auto">
              {JSON.stringify(vehicleRoutes, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DebugPage;