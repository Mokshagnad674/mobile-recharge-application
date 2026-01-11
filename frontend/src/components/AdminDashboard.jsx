import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('plans'); // 'plans', 'subscriptions', 'failures'
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({ planName: '', price: '', dataLimit: '', validity: '' });
  const [newPlan, setNewPlan] = useState({ planName: '', price: '', dataLimit: '', validity: '' });

  useEffect(() => {
    // Role-based access control
    if (user.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
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

    fetchAdminData();
  }, [user, onBack, onLogout]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all plans
      const plansResponse = await fetch('/admin/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (plansResponse.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      if (plansResponse.status === 403) {
        alert('Access denied. Admin privileges required.');
        onBack();
        return;
      }

      // Fetch all subscriptions
      const subscriptionsResponse = await fetch('/admin/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Process plans data
      const plansResult = await plansResponse.json();
      setPlans(plansResult.plans || [
        { id: 1, planName: "Basic Plan", price: 199, dataLimit: "1GB/day", validity: 28, planStatus: "Active" },
        { id: 2, planName: "Premium Plan", price: 399, dataLimit: "2GB/day", validity: 30, planStatus: "Active" },
        { id: 3, planName: "Ultra Plan", price: 699, dataLimit: "3GB/day", validity: 60, planStatus: "Expired" }
      ]);

      // Process subscriptions data
      const subscriptionsResult = await subscriptionsResponse.json();
      setSubscriptions(subscriptionsResult.subscriptions || [
        { id: 1, username: "9876543210", planname: "Premium Plan", status: "Active", subscriptionDate: "2024-01-15T10:30:00Z" },
        { id: 2, username: "9876543211", planname: "Basic Plan", status: "Active", subscriptionDate: "2024-01-14T14:20:00Z" },
        { id: 3, username: "9876543212", planname: "Ultra Plan", status: "Failed", subscriptionDate: "2024-01-13T16:45:00Z" }
      ]);
    } catch (error) {
      setError('Unable to load admin data. Please retry.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const addPlan = async () => {
    if (!newPlan.planName || !newPlan.price || !newPlan.dataLimit || !newPlan.validity) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/admin/plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPlan)
      });

      if (response.ok) {
        setPlans([...plans, { ...newPlan, id: Date.now(), planStatus: 'Active' }]);
        setNewPlan({ planName: '', price: '', dataLimit: '', validity: '' });
        setShowAddPlanModal(false);
      }
    } catch (error) {
      alert('Failed to add plan');
    }
  };

  const updatePlan = async (planId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/plans/${planId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setPlans(plans.map(plan => 
          plan._id === planId ? { ...plan, ...updates } : plan
        ));
        setEditingPlan(null);
      }
    } catch (error) {
      alert('Failed to update plan');
    }
  };

  const togglePlanStatus = async (planId) => {
    const plan = plans.find(p => p._id === planId);
    const newStatus = plan.planStatus === 'Active' ? 'Expired' : 'Active';
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/plans/${planId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setPlans(plans.map(plan => 
          plan._id === planId ? { ...plan, planStatus: newStatus } : plan
        ));
      }
    } catch (error) {
      alert('Failed to update plan status');
    }
  };

  const startEdit = (plan) => {
    setEditingPlan(plan._id);
    setEditForm({
      planName: plan.planName,
      price: plan.price,
      dataLimit: plan.dataLimit,
      validity: plan.validity
    });
  };

  const saveEdit = () => {
    updatePlan(editingPlan, editForm);
  };

  const deletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPlans(plans.filter(plan => (plan._id || plan.id) !== planId));
      }
    } catch (error) {
      alert('Failed to delete plan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Expired': return '#dc3545';
      case 'Failed': return '#dc3545';
      case 'Pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (user.role !== 'admin') {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <button onClick={onBack} className="btn btn-secondary" style={{ width: 'auto', marginBottom: 0 }}>
              ← Back
            </button>
            <h2 className="header-title">🔒 Admin Dashboard</h2>
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: 'auto', marginBottom: 0 }}>
              Logout
            </button>
          </div>
        </header>
        
        <div className="content-container">
          <div className="loading-skeleton" style={{ height: '60px', marginBottom: '20px' }}></div>
          {[1,2,3].map(i => (
            <div key={i} className="loading-skeleton" style={{ height: '80px', margin: '10px 0' }}></div>
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
          <button onClick={onBack} className="btn btn-secondary" style={{ width: 'auto', marginBottom: 0 }}>
            ← Back
          </button>
          <h2 className="header-title">🔒 Admin Dashboard</h2>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: 'auto', marginBottom: 0 }}>
            Logout
          </button>
        </div>
      </header>

      <div className="content-container">
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={fetchAdminData} className="btn btn-danger" style={{ marginLeft: '10px', padding: '5px 10px', width: 'auto' }}>
              Retry
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="card mb-4">
          <div className="flex" style={{ borderBottom: '1px solid var(--gray-200)' }}>
            {[
              { key: 'plans', label: '📋 Plan Management', icon: '📋' },
              { key: 'subscriptions', label: '📊 Subscription Monitoring', icon: '📊' },
              { key: 'failures', label: '⚠️ Failure Tracking', icon: '⚠️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  flex: 1, 
                  borderRadius: 0, 
                  marginBottom: 0,
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Management Tab */}
        {activeTab === 'plans' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Recharge Plan Management</h3>
              <button 
                onClick={() => setShowAddPlanModal(true)}
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
              >
                Add New Plan
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {plans.map(plan => (
                <div key={plan._id || plan.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>{plan.planName}</h4>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: `${getStatusColor(plan.planStatus)}20`,
                      color: getStatusColor(plan.planStatus),
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {plan.planStatus}
                    </span>
                  </div>
                  
                  {editingPlan === (plan._id || plan.id) ? (
                    <div style={{ marginBottom: '15px' }}>
                      <input
                        type="text"
                        value={editForm.planName}
                        onChange={(e) => setEditForm({...editForm, planName: e.target.value})}
                        style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="Plan Name"
                      />
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                        style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="Price"
                      />
                      <input
                        type="text"
                        value={editForm.dataLimit}
                        onChange={(e) => setEditForm({...editForm, dataLimit: e.target.value})}
                        style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="Data Limit"
                      />
                      <input
                        type="number"
                        value={editForm.validity}
                        onChange={(e) => setEditForm({...editForm, validity: e.target.value})}
                        style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="Validity"
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                      <div><strong>Price:</strong> ₹{plan.price}</div>
                      <div><strong>Data:</strong> {plan.dataLimit}</div>
                      <div><strong>Validity:</strong> {plan.validity} days</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {editingPlan === (plan._id || plan.id) ? (
                      <>
                        <button 
                          onClick={saveEdit}
                          style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingPlan(null)}
                          style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEdit(plan)}
                          style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => togglePlanStatus(plan._id || plan.id)}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: plan.planStatus === 'Active' ? '#ffc107' : '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          {plan.planStatus === 'Active' ? 'Expire' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => deletePlan(plan._id || plan.id)}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Monitoring Tab */}
        {activeTab === 'subscriptions' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Subscription Monitoring</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {subscriptions.map(sub => (
                <div key={sub.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{sub.username}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {new Date(sub.subscriptionDate).toLocaleDateString()} at {new Date(sub.subscriptionDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: `${getStatusColor(sub.status)}20`,
                      color: getStatusColor(sub.status),
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>Plan:</strong> {sub.planname}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failure Tracking Tab */}
        {activeTab === 'failures' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Recharge Failure & Pending Tracking</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {subscriptions.filter(sub => sub.status === 'Failed' || sub.status === 'Pending').map(sub => (
                <div key={sub.id} style={{ border: '1px solid #dc3545', borderRadius: '8px', padding: '15px', backgroundColor: '#fff5f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{sub.username}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {new Date(sub.subscriptionDate).toLocaleDateString()} at {new Date(sub.subscriptionDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: `${getStatusColor(sub.status)}20`,
                      color: getStatusColor(sub.status),
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    <strong>Plan:</strong> {sub.planname}
                  </div>
                  
                  <button 
                    style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                  >
                    Investigate
                  </button>
                </div>
              ))}
              
              {subscriptions.filter(sub => sub.status === 'Failed' || sub.status === 'Pending').length === 0 && (
                <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
                  <p>No failed or pending recharges found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Add New Plan</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <input
                type="text"
                placeholder="Plan Name"
                value={newPlan.planName}
                onChange={(e) => setNewPlan({...newPlan, planName: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Data Limit (e.g., 2GB/day)"
                value={newPlan.dataLimit}
                onChange={(e) => setNewPlan({...newPlan, dataLimit: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="Validity (days)"
                value={newPlan.validity}
                onChange={(e) => setNewPlan({...newPlan, validity: e.target.value})}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setShowAddPlanModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: 'white' }}
              >
                Cancel
              </button>
              <button 
                onClick={addPlan}
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px' }}
              >
                Add Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;