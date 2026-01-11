import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    address: '',
    pincode: '',
    mobile: ''
  });

  const sendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Invalid number');
      return;
    }

    // Validate Indian mobile number format
    const firstDigit = mobile.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      setError('Invalid number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      
      const result = await response.json();
      if (response.ok) {
        if (result.isNewUser) {
          setRegistrationData({ ...registrationData, mobile });
          setStep('register');
        } else {
          setStep('otp');
        }
        setOtp('');
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const registerUser = async () => {
    if (!registrationData.name || !registrationData.address || !registrationData.pincode) {
      setError('Please fill all fields');
      return;
    }
    
    if (registrationData.pincode.length !== 6) {
      setError('Invalid pincode');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      const result = await response.json();
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp) {
      setError('OTP cannot be empty');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin(result.user);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setStep('mobile');
    setError('');
  };



  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">📱 Smart Recharge</h1>
        <p className="login-subtitle">Secure OTP Authentication</p>
        
        {step === 'mobile' && (
          <div>
            {isAdmin && (
              <div className="alert alert-info">
                🔐 Admin Login Mode - Enter admin mobile number
              </div>
            )}
            
            <input
              type="tel"
              placeholder={isAdmin ? "Enter Admin Mobile Number" : "Enter 10-digit Mobile Number"}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="form-input"
              maxLength="10"
            />
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <button 
              onClick={sendOTP} 
              disabled={!mobile || mobile.length !== 10 || loading}
              className={`btn btn-primary ${(!mobile || mobile.length !== 10 || loading) ? 'disabled' : ''}`}
            >
              {loading ? '📤 Sending OTP...' : '📱 Send OTP'}
            </button>

            {!isAdmin && (
              <>
                <div style={{ margin: '20px 0', textAlign: 'center', color: 'var(--gray-400)' }}>
                  OR
                </div>

                <button 
                  onClick={handleAdminLogin}
                  disabled={loading}
                  className={`btn btn-success ${loading ? 'disabled' : ''}`}
                >
                  🔐 Admin Login
                </button>
              </>
            )}

            {isAdmin && (
              <button 
                onClick={() => {
                  setIsAdmin(false);
                  setMobile('');
                  setError('');
                }}
                className="btn btn-secondary"
              >
                ← Back to User Login
              </button>
            )}
          </div>
        )}

        {step === 'register' && (
          <div>
            <div className="alert alert-info">
              📝 New User Registration - {registrationData.mobile}
            </div>
            
            <input
              type="text"
              placeholder="Full Name"
              value={registrationData.name}
              onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
              className="form-input"
            />
            
            <textarea
              placeholder="Complete Address"
              value={registrationData.address}
              onChange={(e) => setRegistrationData({...registrationData, address: e.target.value})}
              className="form-input"
              rows="3"
            />
            
            <input
              type="text"
              placeholder="6-digit Pincode"
              value={registrationData.pincode}
              onChange={(e) => setRegistrationData({...registrationData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
              className="form-input"
              maxLength="6"
            />
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <button 
              onClick={registerUser} 
              disabled={loading}
              className={`btn btn-primary ${loading ? 'disabled' : ''}`}
            >
              {loading ? '📝 Registering...' : '✅ Complete Registration'}
            </button>
            
            <button 
              onClick={() => {
                setStep('mobile');
                setMobile('');
                setError('');
                setRegistrationData({ name: '', address: '', pincode: '', mobile: '' });
              }}
              className="btn btn-secondary"
            >
              ← Back
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <div className="alert alert-info">
              📨 OTP sent to {mobile}
              {isAdmin && <div style={{marginTop: '5px', fontWeight: 'bold'}}>🔐 Admin Login Mode</div>}
            </div>
            
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="form-input"
              maxLength="6"
            />
            
            {error && (
              <div className={error.includes('New OTP') ? 'alert alert-success' : 'alert alert-error'}>
                {error}
              </div>
            )}
            
            <button 
              onClick={verifyOTP} 
              disabled={loading}
              className={`btn btn-primary ${loading ? 'disabled' : ''}`}
            >
              {loading ? '🔍 Verifying...' : '✅ Verify OTP'}
            </button>
            
            <button 
              onClick={sendOTP}
              disabled={loading}
              className={`btn btn-secondary ${loading ? 'disabled' : ''}`}
            >
              {loading ? '📤 Sending...' : '🔄 Resend OTP'}
            </button>
            
            <button 
              onClick={() => {
                setStep('mobile');
                setMobile('');
                setOtp('');
                setError('');
                setIsAdmin(false);
                setRegistrationData({ name: '', address: '', pincode: '', mobile: '' });
              }}
              className="btn btn-secondary"
            >
              ← Change Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;