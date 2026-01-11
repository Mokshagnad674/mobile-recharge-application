import React, { useState, useEffect } from 'react';

const InfoPagesContainer = ({ user, onBack, onLogout, initialTab = 'compliance' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    server: 'Operational',
    recharge: 'Operational',
    maintenance: false
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
      return;
    }
    fetchData();
  }, [onLogout]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock system status check
      setSystemStatus({
        server: 'Operational',
        recharge: 'Operational',
        maintenance: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load data');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operational': return '#28a745';
      case 'Degraded': return '#ffc107';
      case 'Down': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
          <h2 style={{ margin: 0, color: '#333' }}>Information</h2>
          <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
        </header>
        <div style={{ padding: '20px' }}>
          <div style={{ height: '60px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
        <h2 style={{ margin: 0, color: '#333' }}>Information</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Tab Navigation */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {[
              { key: 'compliance', label: '📋 Compliance' },
              { key: 'status', label: '🟢 System Status' },
              { key: 'about', label: 'ℹ️ About App' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  backgroundColor: activeTab === tab.key ? '#007bff' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 Privacy & Compliance</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>🔒 Privacy Policy</h4>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px' }}>
                We are committed to protecting your privacy. Your personal information is encrypted and securely stored. 
                We do not share your data with third parties without your consent.
              </p>
              <button style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}>
                View Full Policy
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>📜 Terms & Conditions</h4>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '10px' }}>
                By using this app, you agree to our terms of service. Recharges are processed securely and 
                refunds are handled as per our refund policy.
              </p>
              <button style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}>
                View Terms
              </button>
            </div>
          </div>
        )}

        {/* System Status Tab */}
        {activeTab === 'status' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🟢 System Health & Status</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🖥️ Server Status</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Main application servers</p>
                </div>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  backgroundColor: `${getStatusColor(systemStatus.server)}20`,
                  color: getStatusColor(systemStatus.server),
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {systemStatus.server}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>💳 Recharge Service</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Payment processing system</p>
                </div>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  backgroundColor: `${getStatusColor(systemStatus.recharge)}20`,
                  color: getStatusColor(systemStatus.recharge),
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {systemStatus.recharge}
                </span>
              </div>

              {systemStatus.maintenance && (
                <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  🔧 Scheduled maintenance on Sunday 2:00 AM - 4:00 AM IST. Services may be temporarily unavailable.
                </div>
              )}
            </div>

            <div style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
              Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* About App Tab */}
        {activeTab === 'about' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>ℹ️ About Smart Recharge</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
              <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Smart Recharge</h2>
              <p style={{ margin: 0, color: '#666' }}>Version 2.1.0</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>📋 App Information</h4>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Version:</span>
                  <span>2.1.0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Build:</span>
                  <span>20240115.1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Last Updated:</span>
                  <span>January 15, 2024</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>Platform:</span>
                  <span>Web App</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>🏢 Developer Information</h4>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Organization:</strong> TelecomTech Solutions</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Support:</strong> support@telecomtech.com</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Phone:</strong> 1800-123-4567</p>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>Website:</strong> www.telecomtech.com</p>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>🔄 Recent Updates</h4>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '14px' }}>v2.1.0 - January 15, 2024</strong>
                  <ul style={{ margin: '5px 0 0 20px', fontSize: '14px', color: '#666' }}>
                    <li>Added usage analytics dashboard</li>
                    <li>Improved notification system</li>
                    <li>Enhanced security features</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ fontSize: '14px' }}>v2.0.0 - December 1, 2023</strong>
                  <ul style={{ margin: '5px 0 0 20px', fontSize: '14px', color: '#666' }}>
                    <li>Complete UI redesign</li>
                    <li>Added admin dashboard</li>
                    <li>Implemented support system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPagesContainer;