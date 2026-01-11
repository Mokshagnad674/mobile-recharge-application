import React, { useState, useEffect } from 'react';

const RechargeStatusPage = ({ user, rechargeData, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [error, setError] = useState('');

  // Access Control - Redirect if no recharge data
  useEffect(() => {
    if (!rechargeData) {
      alert('No recent recharge found');
      onBack();
      return;
    }
    
    // Token validation
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
      return;
    }

    fetchRechargeStatus();
  }, [rechargeData, onBack, onLogout]);

  const fetchRechargeStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/user/subscription/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      const result = await response.json();
      if (result.subscription) {
        setSubscriptionStatus(result.subscription);
      } else {
        // Use recharge data as fallback
        setSubscriptionStatus({
          mobile: user.mobile,
          planName: rechargeData.planName,
          amount: rechargeData.price,
          dataLimit: rechargeData.dataLimit,
          validity: rechargeData.validity,
          status: rechargeData.success ? 'Active' : 'Pending',
          transactionTime: new Date().toLocaleString(),
          startDate: new Date().toLocaleDateString(),
          endDate: new Date(Date.now() + rechargeData.validity * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
      }
    } catch (error) {
      setError('Unable to fetch recharge status. Please try again.');
      // Use recharge data as fallback
      setSubscriptionStatus({
        mobile: user.mobile,
        planName: rechargeData.planName,
        amount: rechargeData.price,
        dataLimit: rechargeData.dataLimit,
        validity: rechargeData.validity,
        status: 'Pending',
        transactionTime: new Date().toLocaleString(),
        startDate: new Date().toLocaleDateString(),
        endDate: new Date(Date.now() + rechargeData.validity * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return '✅';
      case 'Pending': return '⏳';
      case 'Failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'Active': return 'Recharge Successful';
      case 'Pending': return 'Your recharge is being processed. Please check again shortly.';
      case 'Failed': return 'Recharge Failed. Please try again or contact support.';
      default: return 'Recharge Status Unknown';
    }
  };

  if (!rechargeData) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={onBack}
            style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, color: '#333' }}>Recharge Status</h2>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </header>
        
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ height: '60px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}></div>
          <div style={{ height: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={onBack}
          style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, color: '#333' }}>Recharge Status</h2>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Logout
        </button>
      </header>

      <div style={{ padding: '20px' }}>
        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
            <button 
              onClick={fetchRechargeStatus} 
              style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Refresh Status
            </button>
          </div>
        )}

        {/* Recharge Status Section */}
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>
            {getStatusIcon(subscriptionStatus?.status)}
          </div>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            color: getStatusColor(subscriptionStatus?.status),
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {getStatusMessage(subscriptionStatus?.status)}
          </h2>
          {subscriptionStatus?.status === 'Pending' && (
            <button 
              onClick={fetchRechargeStatus}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                marginTop: '10px'
              }}
            >
              Refresh Status
            </button>
          )}
        </div>

        {/* Subscription Summary Card */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>Subscription Summary</h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Mobile Number:</span>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{subscriptionStatus?.mobile}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Plan Name:</span>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{subscriptionStatus?.planName}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Amount Paid:</span>
              <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '18px' }}>₹{subscriptionStatus?.amount}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Data Benefits:</span>
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                {subscriptionStatus?.dataLimit} 
                <small style={{ color: '#666', marginLeft: '5px' }}>
                  (Total: {parseInt(subscriptionStatus?.dataLimit) * subscriptionStatus?.validity}GB)
                </small>
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Validity:</span>
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                {subscriptionStatus?.validity} days
                <br />
                <small style={{ color: '#666' }}>
                  {subscriptionStatus?.startDate} to {subscriptionStatus?.endDate}
                </small>
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Subscription Status:</span>
              <span style={{ 
                fontWeight: 'bold', 
                color: getStatusColor(subscriptionStatus?.status),
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: `${getStatusColor(subscriptionStatus?.status)}20`,
                fontSize: '14px'
              }}>
                {subscriptionStatus?.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Transaction Time:</span>
              <span style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                {subscriptionStatus?.transactionTime}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
          <button 
            onClick={onBack}
            style={{ 
              flex: 1,
              padding: '12px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Explore More Plans
          </button>
          
          {subscriptionStatus?.status === 'Failed' && (
            <button 
              onClick={onBack}
              style={{ 
                flex: 1,
                padding: '12px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RechargeStatusPage;