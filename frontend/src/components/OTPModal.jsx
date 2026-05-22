import React, { useState, useEffect, useRef } from 'react';

const OTPModal = ({ isOpen, onVerify, phone }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
    
    if (index === 3 && value) {
      // automatically verify if we want
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const submit = () => {
    const code = otp.join('');
    if (code.length === 4) {
      onVerify(code);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div className="surface-card" style={{ width: '90%', maxWidth: '350px' }}>
        <h2 className="mb-2 text-center">Enter OTP</h2>
        <p className="text-center mb-3">OTP sent to {phone}</p>
        
        <div className="flex justify-center gap-4 mb-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              style={{
                width: '50px',
                height: '50px',
                textAlign: 'center',
                fontSize: '24px',
                padding: 0
              }}
            />
          ))}
        </div>

        <button className="btn-primary mb-2" onClick={submit}>
          Verify OTP
        </button>

        <div className="text-center">
          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button className="btn-secondary" onClick={() => setTimer(30)}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
