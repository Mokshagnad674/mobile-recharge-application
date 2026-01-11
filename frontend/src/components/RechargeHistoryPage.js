import React, { useState, useEffect } from 'react';

const RechargeHistoryPage = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    // Token validation
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
      return;
    }

    fetchAccountData();
  }, [onLogout]);

  const fetchAccountData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch active subscription
      const subscriptionResponse = await fetch(`/user/subscription/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (subscriptionResponse.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      // Fetch recharge history
      const historyResponse = await fetch(`/user/recharge-history/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (historyResponse.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      // Process subscription data
      const subscriptionResult = await subscriptionResponse.json();
      if (subscriptionResult.subscription) {
        const sub = subscriptionResult.subscription;
        const expiryDate = new Date(sub.expiryDate || Date.now() + 30 * 24 * 60 * 60 * 1000);
        const remainingDays = Math.max(0, Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)));
        
        setActiveSubscription({
          ...sub,
          expiryDate: expiryDate.toLocaleDateString(),
          remainingDays,
          status: remainingDays > 0 ? 'Active' : 'Expired'
        });
      }

      // Process history data
      const historyResult = await historyResponse.json();
      if (historyResult.history) {
        setRechargeHistory(historyResult.history);
      } else {
        // Mock data for demonstration
        setRechargeHistory([
          {
            id: 1,
            date: '2024-01-15 14:30:00',
            planName: 'Premium Plan',
            amount: 399,
            validity: 30,
            status: 'Success'
          },
          {
            id: 2,
            date: '2023-12-15 10:15:00',
            planName: 'Basic Plan',
            amount: 199,
            validity: 28,
            status: 'Success'
          },
          {
            id: 3,
            date: '2023-11-20 16:45:00',
            planName: 'Ultra Plan',
            amount: 699,
            validity: 60,
            status: 'Failed'
          }
        ]);
      }
    } catch (error) {
      setError('Unable to load account data. Please try again.');
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
      case 'Success': case 'Active': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Failed': case 'Expired': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success': case 'Active': return '✅';
      case 'Pending': return '⏳';
      case 'Failed': case 'Expired': return '❌';
      default: return '❓';
    }
  };

  const sortedHistory = [...rechargeHistory].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return b.amount - a.amount;
      case 'validity':
        return b.validity - a.validity;
      default:
        return 0;
    }
  });

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
          <h2 style={{ margin: 0, color: '#333' }}>My Recharges</h2>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </header>
        
        <div style={{ padding: '20px' }}>
          <div style={{ height: '120px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}></div>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '80px', backgroundColor: '#f0f0f0', margin: '10px 0', borderRadius: '8px' }}></div>
          ))}
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
        <h2 style={{ margin: 0, color: '#333' }}>My Recharges</h2>
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
              onClick={fetchAccountData} 
              style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Account Overview Section */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>Account Overview</h3>
          
          {activeSubscription ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: '600', color: '#666' }}>Mobile Number:</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{user.mobile}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: '600', color: '#666' }}>Active Plan:</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{activeSubscription.planname || activeSubscription.planName}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: '600', color: '#666' }}>Validity Ends On:</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{activeSubscription.expiryDate}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: '600', color: '#666' }}>Remaining Days:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: activeSubscription.remainingDays > 7 ? '#28a745' : activeSubscription.remainingDays > 0 ? '#ffc107' : '#dc3545'
                }}>
                  {activeSubscription.remainingDays} days
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontWeight: '600', color: '#666' }}>Subscription Status:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: getStatusColor(activeSubscription.status),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {getStatusIcon(activeSubscription.status)} {activeSubscription.status}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              <p>No active subscription found</p>
            </div>
          )}
        </div>

        {/* Recharge History Section */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Recharge History</h3>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="latest">Latest First</option>
              <option value="amount">Amount: High → Low</option>
              <option value="validity">Validity Duration</option>
            </select>
          </div>

          {sortedHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>📱</p>
              <p>You have not made any recharges yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {sortedHistory.map((recharge) => (
                <div key={recharge.id} style={{ 
                  border: '1px solid #eee', 
                  borderRadius: '8px', 
                  padding: '15px',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{recharge.planName}</h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {new Date(recharge.date).toLocaleDateString()} at {new Date(recharge.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: getStatusColor(recharge.status),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '14px'
                    }}>
                      {getStatusIcon(recharge.status)} {recharge.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                    <span>Amount: <strong style={{ color: '#007bff' }}>₹{recharge.amount}</strong></span>
                    <span>Validity: <strong>{recharge.validity} days</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '25px' }}>
          <button 
            onClick={onBack}
            style={{ 
              width: '100%',
              padding: '12px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Explore New Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default RechargeHistoryPage;