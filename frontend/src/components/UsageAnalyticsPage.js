import React, { useState, useEffect } from 'react';

const UsageAnalyticsPage = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
      return;
    }
    fetchUsageData();
  }, [onLogout]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/usage/analytics/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      // Mock data for demonstration
      setUsageData({
        dailyLimit: 2048, // 2GB in MB
        usedToday: 1843, // 1.8GB used
        totalData: 60480, // 60GB total
        totalUsed: 45360, // 45GB used
        validityDays: 30,
        remainingDays: 12,
        dailyUsage: [1200, 1800, 2000, 1500, 1843] // Last 5 days
      });
    } catch (error) {
      setError('Unable to load usage data. Please try again.');
    }
    setLoading(false);
  };

  const formatData = (mb) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)}GB`;
    return `${mb}MB`;
  };

  const getUsagePercentage = (used, total) => Math.min((used / total) * 100, 100);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
          <h2 style={{ margin: 0, color: '#333' }}>Usage Analytics</h2>
          <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
        </header>
        <div style={{ padding: '20px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '100px', backgroundColor: '#f0f0f0', margin: '10px 0', borderRadius: '8px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
        <h2 style={{ margin: 0, color: '#333' }}>Usage Analytics</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>

      <div style={{ padding: '20px' }}>
        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
            <button onClick={fetchUsageData} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Retry</button>
          </div>
        )}

        {/* Daily Usage */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Today's Usage</h3>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{formatData(usageData.usedToday)} used</span>
              <span>{formatData(usageData.dailyLimit - usageData.usedToday)} remaining</span>
            </div>
            <div style={{ width: '100%', height: '20px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${getUsagePercentage(usageData.usedToday, usageData.dailyLimit)}%`, height: '100%', backgroundColor: usageData.usedToday > usageData.dailyLimit * 0.9 ? '#dc3545' : '#28a745', transition: 'width 0.3s' }}></div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Daily Limit: {formatData(usageData.dailyLimit)}</p>
        </div>

        {/* Total Usage */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Total Usage</h3>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{formatData(usageData.totalUsed)} used</span>
              <span>{formatData(usageData.totalData - usageData.totalUsed)} remaining</span>
            </div>
            <div style={{ width: '100%', height: '20px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${getUsagePercentage(usageData.totalUsed, usageData.totalData)}%`, height: '100%', backgroundColor: '#007bff', transition: 'width 0.3s' }}></div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Data: {formatData(usageData.totalData)}</p>
        </div>

        {/* Validity */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>⏰ Validity</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: usageData.remainingDays <= 3 ? '#dc3545' : '#28a745' }}>{usageData.remainingDays} days</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>remaining</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>Total: {usageData.validityDays} days</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{usageData.validityDays - usageData.remainingDays} days used</p>
            </div>
          </div>
        </div>

        {/* Usage Trend */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Daily Usage Trend</h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: '10px', height: '100px' }}>
            {usageData.dailyUsage.map((usage, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${(usage / Math.max(...usageData.dailyUsage)) * 80}px`, 
                  backgroundColor: index === usageData.dailyUsage.length - 1 ? '#007bff' : '#28a745',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '5px'
                }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>Day {index + 1}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666', textAlign: 'center' }}>Last 5 days usage pattern</p>
        </div>
      </div>
    </div>
  );
};

export default UsageAnalyticsPage;