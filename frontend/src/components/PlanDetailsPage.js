import React, { useState, useEffect } from 'react';

const PlanDetailsPage = ({ user, selectedPlan, onBack, onLogout, onRechargeComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [rechargeData, setRechargeData] = useState(null);

  // Access Control - Redirect if no plan selected
  useEffect(() => {
    if (!selectedPlan) {
      alert('Please select a recharge plan first');
      onBack();
    }
  }, [selectedPlan, onBack]);

  // Token validation
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
    }
  }, [onLogout]);

  const handleRecharge = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: user.mobile,
          planname: selectedPlan.planName,
          subscriptionDuration: selectedPlan.validity
        })
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      const result = await response.json();
      if (result.success) {
        const rechargeInfo = {
          planName: selectedPlan.planName,
          price: selectedPlan.price,
          dataLimit: selectedPlan.dataLimit,
          validity: selectedPlan.validity,
          success: true
        };
        setRechargeData(rechargeInfo);
        setRechargeSuccess(true);
        setShowConfirmModal(false);
      } else {
        setError(result.message || 'Recharge failed. Please try again.');
      }
    } catch (error) {
      setError('Recharge failed. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (!selectedPlan) {
    return null; // Will redirect via useEffect
  }

  if (rechargeSuccess) {
    // Navigate to status page
    onRechargeComplete(rechargeData);
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <button 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ width: 'auto', marginBottom: 0 }}
          >
            ← Back
          </button>
          <h2 className="header-title">Confirm Your Recharge</h2>
          <button 
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: 'auto', marginBottom: 0 }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="content-container">
        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              onClick={() => setError('')} 
              className="btn btn-danger"
              style={{ marginLeft: '10px', padding: '5px 10px', width: 'auto' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Plan Summary Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Plan Summary</h3>
          </div>
          <div className="card-body">
            <div className="plan-details">
              <div className="plan-detail">
                <div className="plan-detail-icon">📱</div>
                <span>Plan Name: <strong>{selectedPlan.planName}</strong></span>
              </div>
              
              <div className="plan-detail">
                <div className="plan-detail-icon">💰</div>
                <span>Price: <strong className="text-primary">₹{selectedPlan.price}</strong></span>
              </div>
              
              <div className="plan-detail">
                <div className="plan-detail-icon">📶</div>
                <span>Daily Data: <strong>{selectedPlan.dataLimit}</strong></span>
              </div>
              
              <div className="plan-detail">
                <div className="plan-detail-icon">📅</div>
                <span>Validity: <strong>{selectedPlan.validity} days</strong></span>
              </div>
              
              <div className="plan-detail">
                <div className="plan-detail-icon">📊</div>
                <span>Total Data: <strong className="text-success">{parseInt(selectedPlan.dataLimit) * selectedPlan.validity}GB</strong></span>
              </div>
              
              <div className="plan-detail">
                <div className="plan-detail-icon">🏷️</div>
                <span>Plan Type: <strong>Prepaid</strong></span>
              </div>
              
              <div className="plan-detail">
                <div className="plan-detail-icon">✅</div>
                <span>Plan Status: <strong className="text-success">Active</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recharge Button */}
        <button 
          onClick={() => setShowConfirmModal(true)}
          disabled={loading}
          className={`btn btn-success ${loading ? 'disabled' : ''}`}
          style={{ fontSize: '18px', padding: 'var(--space-lg)' }}
        >
          {loading ? 'Processing...' : `💳 Recharge for ₹${selectedPlan.price}`}
        </button>

        {/* Mobile Number Display */}
        <div className="text-center mt-4">
          <p className="text-gray">Recharging for: <strong className="text-primary">{user.mobile}</strong></p>
        </div>
      </div>

      {/* Double Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">🔒 Final Confirmation</h3>
            </div>
            <div className="modal-body">
              <p>Please confirm that you want to recharge with this plan:</p>
              
              <div className="alert alert-info">
                <div className="font-bold mb-1">{selectedPlan.planName}</div>
                <div className="text-primary" style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{selectedPlan.price}</div>
                <div className="text-gray" style={{ fontSize: '14px' }}>
                  {selectedPlan.dataLimit} • {selectedPlan.validity} days
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleRecharge} 
                disabled={loading}
                className={`btn btn-success ${loading ? 'disabled' : ''}`}
              >
                {loading ? 'Processing...' : '✅ Confirm Recharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetailsPage;