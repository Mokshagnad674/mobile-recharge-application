import React, { useState, useEffect } from 'react';

const NotificationsPage = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'recharge', 'expiry', 'usage', 'security'
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationCategories = {
    recharge: { label: 'Recharge', icon: '💳', color: '#007bff' },
    expiry: { label: 'Plan Expiry', icon: '⏰', color: '#ffc107' },
    usage: { label: 'Usage Alerts', icon: '📊', color: '#28a745' },
    security: { label: 'Security', icon: '🔐', color: '#dc3545' },
    system: { label: 'System', icon: '🔔', color: '#6c757d' }
  };

  useEffect(() => {
    // Token validation
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to view notifications');
      onLogout();
      return;
    }

    fetchNotifications();
  }, [onLogout]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/notifications/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
        return;
      }

      const result = await response.json();
      const notificationsData = result.notifications || [];

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    } catch (error) {
      setError('Unable to load notifications. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const clearNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to clear notification');
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`/notifications/${user.mobile}/clear-all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear all notifications');
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

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
          <h2 style={{ margin: 0, color: '#333' }}>Notifications & Alerts</h2>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </header>
        
        <div style={{ padding: '20px' }}>
          <div style={{ height: '60px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}></div>
          {[1,2,3,4].map(i => (
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
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Notifications & Alerts</h2>
          {unreadCount > 0 && (
            <small style={{ color: '#dc3545', fontWeight: 'bold' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </small>
          )}
        </div>
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
              onClick={fetchNotifications} 
              style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #eee' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '12px 16px',
                border: 'none',
                backgroundColor: filter === 'all' ? '#007bff' : 'transparent',
                color: filter === 'all' ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filter === 'all' ? 'bold' : 'normal',
                whiteSpace: 'nowrap'
              }}
            >
              🔔 All ({notifications.length})
            </button>
            {Object.entries(notificationCategories).map(([key, category]) => {
              const count = notifications.filter(n => n.type === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: filter === key ? category.color : 'transparent',
                    color: filter === key ? 'white' : '#333',
                    cursor: 'pointer',
                    fontWeight: filter === key ? 'bold' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {category.icon} {category.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <button 
              onClick={clearAllNotifications}
              style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
            >
              Clear All Notifications
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>🔔</p>
              <p>No notifications found.</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification, index) => (
                <div 
                  key={notification._id} 
                  style={{ 
                    padding: '20px', 
                    borderBottom: index < filteredNotifications.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: notification.isRead ? 'white' : '#f8f9ff',
                    position: 'relative'
                  }}
                >
                  {/* Priority Indicator */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: 0, 
                      top: 0, 
                      bottom: 0, 
                      width: '4px', 
                      backgroundColor: getPriorityColor(notification.priority) 
                    }}
                  ></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '18px', marginRight: '8px' }}>
                          {notificationCategories[notification.type]?.icon || '🔔'}
                        </span>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span style={{ 
                            marginLeft: '8px', 
                            width: '8px', 
                            height: '8px', 
                            backgroundColor: '#007bff', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }}></span>
                        )}
                      </div>
                      
                      <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                        {notification.message}
                      </p>
                      
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {getTimeAgo(notification.createdAt || notification.timestamp)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification._id)}
                          style={{ 
                            padding: '4px 8px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        onClick={() => clearNotification(notification.id)}
                        style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#6c757d', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;