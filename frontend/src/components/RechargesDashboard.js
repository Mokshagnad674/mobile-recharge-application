import React, { useState, useEffect } from 'react';

const RechargesDashboard = ({ user, onLogout, onSelectPlan, onViewHistory, onViewAdmin, onViewSupport, onViewNotifications, onViewUsage, onViewRefunds, onViewSettings, onViewInfo }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ price: '', validity: '', data: '' });
  const [sortBy, setSortBy] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please login again.');
        setTimeout(() => onLogout(), 2000);
        return;
      }

      const response = await fetch('/user/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => onLogout(), 2000);
        return;
      }

      const result = await response.json();
      setPlans(result.plans || [
        { id: 1, planName: "Basic Plan", price: 199, dataLimit: "1GB/day", validity: 28, planStatus: "Active", tag: "Popular" },
        { id: 2, planName: "Premium Plan", price: 399, dataLimit: "2GB/day", validity: 30, planStatus: "Active", tag: "Best Value" },
        { id: 3, planName: "Ultra Plan", price: 699, dataLimit: "3GB/day", validity: 60, planStatus: "Active", tag: "" }
      ]);
    } catch (error) {
      setError('Unable to fetch plans. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleRecharge = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const confirmRecharge = () => {
    setShowConfirmModal(false);
    onSelectPlan(selectedPlan);
  };

  const filteredPlans = plans.filter(plan => {
    return (!filter.price || plan.price <= parseInt(filter.price)) &&
           (!filter.validity || plan.validity >= parseInt(filter.validity)) &&
           (!filter.data || plan.dataLimit.includes(filter.data));
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'validity-short':
        return a.validity - b.validity;
      case 'validity-long':
        return b.validity - a.validity;
      default:
        return a.price - b.price;
    }
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="loading-skeleton" style={{ height: '60px', marginBottom: '20px' }}></div>
        </div>
        <div className="content-container">
          {[1,2,3].map(i => (
            <div key={i} className="loading-skeleton" style={{ height: '120px', margin: '10px 0' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h2 className="header-title">📱 Smart Recharge</h2>
            <small className="header-subtitle">Welcome, {user.mobile}</small>
            <div className="nav-links">
              <button onClick={() => onViewHistory()} className="nav-link">
                View Recharge History
              </button>
              {user.role !== 'admin' && (
                <button onClick={() => onViewSupport()} className="nav-link">
                  Help & Support
                </button>
              )}
              <button onClick={() => onViewNotifications()} className="nav-link">
                Notifications
              </button>
              <button onClick={() => onViewRefunds()} className="nav-link">
                Refunds
              </button>
              <button onClick={() => onViewSettings()} className="nav-link">
                Settings
              </button>
              <button onClick={() => onViewInfo()} className="nav-link">
                More Info
              </button>
              {user.role === 'admin' && (
                <button onClick={() => onViewAdmin()} className="nav-link">
                  Admin Dashboard
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutModal(true)}
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
            {error.includes('Unable to fetch') && (
              <button onClick={fetchPlans} className="btn btn-primary" style={{ marginLeft: '10px', padding: '5px 10px', width: 'auto' }}>Retry</button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="filters-container">
          <h3 className="filters-title">Filters & Sort</h3>
          <div className="filters-grid">
            <select value={filter.price} onChange={(e) => setFilter({...filter, price: e.target.value})} className="filter-select">
              <option value="">All Prices</option>
              <option value="300">Under ₹300</option>
              <option value="500">Under ₹500</option>
            </select>
            <select value={filter.validity} onChange={(e) => setFilter({...filter, validity: e.target.value})} className="filter-select">
              <option value="">All Validity</option>
              <option value="28">28+ Days</option>
              <option value="60">60+ Days</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="">Sort By</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="validity-short">Validity: Short → Long</option>
              <option value="validity-long">Validity: Long → Short</option>
            </select>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="plans-grid">
          {sortedPlans.map(plan => (
            <div key={plan.id} className="plan-card">
              {plan.tag && (
                <span className={`plan-tag ${plan.tag === 'Popular' ? 'popular' : plan.tag === 'Best Value' ? 'best-value' : ''}`}>
                  {plan.tag}
                </span>
              )}
              <h3 className="plan-name">{plan.planName}</h3>
              <div className="plan-details">
                <div className="plan-price">₹{plan.price}</div>
                <div className="plan-detail">
                  <div className="plan-detail-icon">📶</div>
                  <span>Daily Data: {plan.dataLimit}</span>
                </div>
                <div className="plan-detail">
                  <div className="plan-detail-icon">📅</div>
                  <span>Validity: {plan.validity} days</span>
                </div>
                <div className="plan-detail">
                  <div className="plan-detail-icon">📊</div>
                  <span>Total Data: {parseInt(plan.dataLimit) * plan.validity}GB</span>
                </div>
              </div>
              <button 
                onClick={() => handleRecharge(plan)}
                className="btn btn-success"
              >
                Recharge Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Do you really want to logout?</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowLogoutModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Plan Selection</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to continue with this plan?</p>
              <div className="alert alert-info">
                <strong>{selectedPlan.planName}</strong><br/>
                ₹{selectedPlan.price} - {selectedPlan.dataLimit} - {selectedPlan.validity} days
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={confirmRecharge} className="btn btn-success">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargesDashboard;