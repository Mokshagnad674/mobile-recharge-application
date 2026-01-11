import React, { useState, useEffect } from 'react';

const RefundsPage = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([]);
  const [prepaidPlans, setPrepaidPlans] = useState([]);
  const [error, setError] = useState('');
  const [processingRefund, setProcessingRefund] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
      return;
    }
    fetchRefunds();
  }, [onLogout]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/refunds/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      const result = await response.json();
      setRefunds(result.refunds || []);

      if (user.role !== 'admin') {
        // Fetch user's prepaid plans for refund requests
        const subscriptionsResponse = await fetch(`/user/subscription-history/${user.mobile}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (subscriptionsResponse.ok) {
          const subsResult = await subscriptionsResponse.json();
          const prepaidPlans = subsResult.subscriptions?.filter(sub => sub.status === 'Prepaid') || [];
          setPrepaidPlans(prepaidPlans);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Unable to load refund data. Please try again.');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Refunded': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Refunded': return '✅';
      case 'Pending': return '⏳';
      case 'Rejected': return '❌';
      default: return '❓';
    }
  };

  const requestRefund = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/refunds/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId, mobile: user.mobile })
      });

      if (response.ok) {
        alert('Refund request submitted successfully');
        fetchRefunds();
      }
    } catch (error) {
      alert('Failed to submit refund request');
    }
  };

  const processRefund = async (ticketId, action) => {
    setProcessingRefund(ticketId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/refunds/${ticketId}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchRefunds(); // Refresh list to get updated status/timestamps
      } else {
        alert('Failed to process refund');
      }
    } catch (error) {
      console.error('Process error:', error);
      alert('Failed to process refund');
    } finally {
      setProcessingRefund(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
          <h2 style={{ margin: 0, color: '#333' }}>Refunds & Reversals</h2>
          <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
        </header>
        <div style={{ padding: '20px' }}>
          {[1, 2].map(i => <div key={i} style={{ height: '100px', backgroundColor: '#f0f0f0', margin: '10px 0', borderRadius: '8px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
        <h2 style={{ margin: 0, color: '#333' }}>Refunds & Reversals</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>

      <div style={{ padding: '20px' }}>
        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
            <button onClick={fetchRefunds} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Retry</button>
          </div>
        )}

        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>💰 Refund Status</h3>

          {user.role !== 'admin' && prepaidPlans.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Request Refund for Prepaid Plans</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                {prepaidPlans.map(plan => (
                  <div key={plan._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <div>
                      <strong>{plan.planname}</strong> - ₹{plan.planname.includes('Basic') ? 199 : plan.planname.includes('Premium') ? 399 : 699}
                      <div style={{ fontSize: '12px', color: '#666' }}>Purchased: {new Date(plan.subscriptionDate).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => requestRefund(plan._id)}
                      style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                    >
                      Request Refund
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {refunds.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>💳</p>
              <p>No refunds or failed recharges found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {refunds.map(refund => (
                <div key={refund.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Refund #{refund.id}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {refund.planName} {user.role === 'admin' && `- ${refund.mobile}`}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: processingRefund === refund.id ? '#17a2b820' : `${getStatusColor(refund.status)}20`,
                      color: processingRefund === refund.id ? '#17a2b8' : getStatusColor(refund.status),
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {processingRefund === refund.id ? '⏳ Processing...' : `${getStatusIcon(refund.status)} ${refund.status}`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                    <div><strong>Amount:</strong> ₹{refund.amount}</div>
                    <div><strong>Initiated:</strong> {new Date(refund.initiatedAt).toLocaleDateString()}</div>
                    {refund.processedAt && (
                      <div><strong>Processed:</strong> {new Date(refund.processedAt).toLocaleDateString()}</div>
                    )}
                    {refund.eta && (
                      <div><strong>ETA:</strong> {new Date(refund.eta).toLocaleDateString()}</div>
                    )}
                  </div>

                  {refund.status === 'Processing' && refund.eta && (
                    <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      ⏰ Refund is being processed. Expected completion by {new Date(refund.eta).toLocaleDateString()}.
                    </div>
                  )}

                  {refund.status === 'Pending' && user.role === 'admin' && processingRefund !== refund.id && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => processRefund(refund.id, 'approve')}
                        style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                      >
                        Approve Refund
                      </button>
                      <button
                        onClick={() => processRefund(refund.id, 'reject')}
                        style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                      >
                        Reject Refund
                      </button>
                    </div>
                  )}

                  {refund.status === 'Pending' && user.role !== 'admin' && (
                    <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      ⏳ Refund request is pending admin approval.
                    </div>
                  )}

                  {refund.status === 'Refunded' && (
                    <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      ✅ Refund completed successfully. Amount has been credited to the original payment method.
                    </div>
                  )}

                  {refund.status === 'Failed' && (
                    <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      ❌ Refund failed. Please contact support for assistance.
                    </div>
                  )}

                  {refund.status === 'Rejected' && (
                    <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                      ❌ Refund request has been rejected. Contact support for more information.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>ℹ️ Refund Information</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
              <li>Failed recharges are automatically detected and refund is initiated within 24 hours</li>
              <li>Refunds typically take 3-5 business days to reflect in your account</li>
              <li>You will receive SMS confirmation once refund is processed</li>
              <li>For queries, contact support with your refund ID</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundsPage;