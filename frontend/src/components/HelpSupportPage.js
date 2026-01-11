import React, { useState, useEffect } from 'react';

const HelpSupportPage = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [lastRecharge, setLastRecharge] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'tickets'
  const [selectedIssue, setSelectedIssue] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newTicketId, setNewTicketId] = useState('');

  const issueCategories = [
    { id: 'benefits_not_received', label: 'Recharge successful but benefits not received' },
    { id: 'recharge_pending', label: 'Recharge pending' },
    { id: 'wrong_plan', label: 'Wrong plan selected' },
    { id: 'otp_login_issues', label: 'OTP / login issues' },
    { id: 'plan_validity_confusion', label: 'Plan validity confusion' },
    { id: 'other', label: 'Other issue' }
  ];

  useEffect(() => {
    // Token validation
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to access support services');
      onLogout();
      return;
    }

    fetchSupportData();
  }, [onLogout]);

  const fetchSupportData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user's support tickets
      const ticketsResponse = await fetch(`/support/tickets/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (ticketsResponse.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      // Fetch last recharge for context
      const rechargeResponse = await fetch(`/user/subscription/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Process tickets data
      const ticketsResult = await ticketsResponse.json();
      setTickets(ticketsResult.tickets || [
        { id: 'SUP12345', issueType: 'Recharge pending', status: 'Open', createdAt: '2024-01-15T10:30:00Z', updatedAt: '2024-01-15T10:30:00Z' },
        { id: 'SUP12344', issueType: 'Plan validity confusion', status: 'Resolved', createdAt: '2024-01-10T14:20:00Z', updatedAt: '2024-01-12T16:45:00Z' }
      ]);

      // Process last recharge data
      if (rechargeResponse.ok) {
        const rechargeResult = await rechargeResponse.json();
        setLastRecharge(rechargeResult.subscription);
      }
    } catch (error) {
      setError('Unable to load support data. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const submitTicket = async () => {
    if (!selectedIssue) {
      alert('Please select an issue category');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/support/tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mobile: user.mobile,
          issueType: issueCategories.find(cat => cat.id === selectedIssue)?.label,
          description: description || 'No additional description provided',
          lastRecharge: lastRecharge ? {
            planName: lastRecharge.planname || lastRecharge.planName,
            amount: lastRecharge.amount || 'N/A',
            date: lastRecharge.subscriptionDate || lastRecharge.createdAt
          } : null
        })
      });

      const result = await response.json();
      if (result.success) {
        setNewTicketId(result.ticketId);
        setShowSuccess(true);
        setSelectedIssue('');
        setDescription('');
        
        // Add new ticket to list
        const newTicket = {
          _id: result.ticket._id,
          ticketId: result.ticketId,
          issueType: issueCategories.find(cat => cat.id === selectedIssue)?.label,
          status: 'Open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTickets([newTicket, ...tickets]);
      } else {
        alert('Failed to submit ticket. Please try again.');
      }
    } catch (error) {
      alert('Failed to submit ticket. Please try again.');
    }
    setSubmitting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#dc3545';
      case 'In Progress': return '#ffc107';
      case 'Resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return '🔴';
      case 'In Progress': return '🟡';
      case 'Resolved': return '✅';
      default: return '❓';
    }
  };

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
          <h2 style={{ margin: 0, color: '#333' }}>Help & Support</h2>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </header>
        
        <div style={{ padding: '20px' }}>
          <div style={{ height: '60px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}></div>
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
        <h2 style={{ margin: 0, color: '#333' }}>Help & Support</h2>
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
              onClick={fetchSupportData} 
              style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>✅ Your issue has been raised successfully</h4>
            <p style={{ margin: 0 }}>Ticket ID: <strong>#{newTicketId}</strong></p>
            <button 
              onClick={() => setShowSuccess(false)}
              style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Close
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            {[
              { key: 'issues', label: 'Report Issue' },
              { key: 'tickets', label: 'My Tickets' }
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
                  fontWeight: activeTab === tab.key ? 'bold' : 'normal'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Issue Tab */}
        {activeTab === 'issues' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Quick Issue Selection</h3>
            
            {/* Context Information */}
            {lastRecharge && (
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>Your Last Recharge</h4>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <p style={{ margin: '5px 0' }}><strong>Plan:</strong> {lastRecharge.planname || lastRecharge.planName}</p>
                  <p style={{ margin: '5px 0' }}><strong>Mobile:</strong> {user.mobile}</p>
                  <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(lastRecharge.subscriptionDate || lastRecharge.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {/* Issue Categories */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                Select your issue:
              </label>
              <div style={{ display: 'grid', gap: '10px' }}>
                {issueCategories.map(category => (
                  <label key={category.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', backgroundColor: selectedIssue === category.id ? '#e3f2fd' : 'white' }}>
                    <input
                      type="radio"
                      name="issue"
                      value={category.id}
                      checked={selectedIssue === category.id}
                      onChange={(e) => setSelectedIssue(e.target.value)}
                      style={{ marginRight: '10px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                Additional details (optional):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in more detail..."
                rows={4}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            {/* Submit Button */}
            <button 
              onClick={submitTicket}
              disabled={submitting || !selectedIssue}
              style={{ 
                width: '100%',
                padding: '12px', 
                backgroundColor: submitting || !selectedIssue ? '#ccc' : '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting || !selectedIssue ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>My Support Tickets</h3>
            
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>🎫</p>
                <p>You have no support tickets yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {tickets.map(ticket => (
                  <div key={ticket._id || ticket.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>#{ticket.ticketId || ticket._id || ticket.id}</h4>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{ticket.issueType}</p>
                      </div>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: `${getStatusColor(ticket.status)}20`,
                        color: getStatusColor(ticket.status),
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {getStatusIcon(ticket.status)} {ticket.status}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleDateString()} at {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupportPage;