import React, { useState, useEffect } from 'react';

const DebugPage = () => {
  const [dbVehicles, setDbVehicles] = useState(null);
  const [redisVehicles, setRedisVehicles] = useState(null);
  const [redisTest, setRedisTest] = useState(null);
  const [routingTest, setRoutingTest] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [vehicleRoutes, setVehicleRoutes] = useState(null);

  const fetchDbVehicles = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/vehicles-db');
      const data = await response.json();
      setDbVehicles(data);
    } catch (error) {
      console.error('Error fetching DB vehicles:', error);
    }
  };

  const fetchRedisVehicles = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/vehicles-redis');
      const data = await response.json();
      setRedisVehicles(data);
    } catch (error) {
      console.error('Error fetching Redis vehicles:', error);
    }
  };

  const testRedis = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/redis-test');
      const data = await response.json();
      setRedisTest(data);
    } catch (error) {
      console.error('Error testing Redis:', error);
    }
  };

  const testRouting = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/test-routing');
      const data = await response.json();
      setRoutingTest(data);
    } catch (error) {
      console.error('Error testing routing:', error);
    }
  };

  const forceLoadRedis = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/force-load-redis', {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.message + ` (${data.loaded}/${data.total})`);
      fetchRedisVehicles(); // Refresh Redis data
    } catch (error) {
      console.error('Error force loading Redis:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchVehicleRoutes = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/vehicle-routes');
      const data = await response.json();
      setVehicleRoutes(data);
    } catch (error) {
      console.error('Error fetching vehicle routes:', error);
    }
  };

  const processAssignments = async () => {
    try {
      const response = await fetch('http://localhost:8080/debug/process-assignments', {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.message);
      fetchAssignments();
      fetchVehicleRoutes();
    } catch (error) {
      console.error('Error processing assignments:', error);
    }
  };

  useEffect(() => {
    fetchDbVehicles();
    fetchRedisVehicles();
    testRedis();
    testRouting();
    fetchAssignments();
    fetchVehicleRoutes();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug: Vehicle Data</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchDbVehicles}>Refresh DB Data</button>
        <button onClick={fetchRedisVehicles} style={{ marginLeft: '10px' }}>Refresh Redis Data</button>
        <button onClick={forceLoadRedis} style={{ marginLeft: '10px', backgroundColor: 'orange', color: 'white' }}>
          Force Load Redis
        </button>
        <button onClick={fetchAssignments} style={{ marginLeft: '10px', backgroundColor: 'blue', color: 'white' }}>
          Refresh Assignments
        </button>
        <button onClick={processAssignments} style={{ marginLeft: '10px', backgroundColor: 'green', color: 'white' }}>
          Process Assignments
        </button>
        <button onClick={testRouting} style={{ marginLeft: '10px', backgroundColor: 'purple', color: 'white' }}>
          Test Routing
        </button>
        <button onClick={fetchVehicleRoutes} style={{ marginLeft: '10px', backgroundColor: 'teal', color: 'white' }}>
          Refresh Routes
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Database Vehicles</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(dbVehicles, null, 2)}
          </pre>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Redis Vehicles</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(redisVehicles, null, 2)}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Redis Connection Test</h2>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(redisTest, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Routing Service Test</h2>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(routingTest, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Assignments</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(assignments, null, 2)}
          </pre>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Vehicle Routes</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(vehicleRoutes, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;