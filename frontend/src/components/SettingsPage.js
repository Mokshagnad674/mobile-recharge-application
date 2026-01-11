import React, { useState, useEffect } from 'react';

const SettingsPage = ({ user, onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    language: 'en',
    sessionTimeout: 30,
    biometric: false,
    autoRecharge: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      onLogout();
      return;
    }
    fetchSettings();
  }, [onLogout]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/settings/${user.mobile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      const result = await response.json();
      if (result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Failed to load settings');
    }
    setLoading(false);
  };

  const updateSetting = async (key, value) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/settings/${user.mobile}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: value })
      });

      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update setting');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
          <h2 style={{ margin: 0, color: '#333' }}>Settings</h2>
          <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
        </header>
        <div style={{ padding: '20px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '60px', backgroundColor: '#f0f0f0', margin: '10px 0', borderRadius: '8px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>← Back</button>
        <h2 style={{ margin: 0, color: '#333' }}>Settings & Preferences</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>

      <div style={{ padding: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>⚙️ Preferences</h3>
          
          {/* Notifications */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🔔 Notifications</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Receive alerts for recharges, expiry, and usage</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.notifications ? '#007bff' : '#ccc',
                borderRadius: '24px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.notifications ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
                }}></span>
              </span>
            </label>
          </div>

          {/* Language */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🌐 Language</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Choose your preferred language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Session Timeout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>⏰ Session Timeout</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Auto-logout after inactivity</p>
            </div>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Biometric */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🔒 Biometric Login</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Use fingerprint or face unlock</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings.biometric}
                onChange={(e) => updateSetting('biometric', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.biometric ? '#007bff' : '#ccc',
                borderRadius: '24px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.biometric ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
                }}></span>
              </span>
            </label>
          </div>

          {/* Auto Recharge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🔄 Auto Recharge</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Automatically recharge before expiry</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings.autoRecharge}
                onChange={(e) => updateSetting('autoRecharge', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.autoRecharge ? '#007bff' : '#ccc',
                borderRadius: '24px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings.autoRecharge ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
                }}></span>
              </span>
            </label>
          </div>

          {saving && (
            <div style={{ textAlign: 'center', color: '#007bff', marginTop: '15px' }}>
              Saving settings...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;