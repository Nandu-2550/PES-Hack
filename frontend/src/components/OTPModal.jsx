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
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div className="card p-6 w-full max-w-[350px] mx-4 space-y-4" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h2 className="text-center text-white font-semibold text-lg" style={{ margin: 0 }}>Enter OTP</h2>
        <p className="text-center text-slate-400 text-sm mb-3" style={{ margin: 0 }}>OTP sent to <span className="text-white font-medium">{phone}</span></p>
        
        <div className="flex justify-center gap-3 mb-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="input-field text-center text-2xl font-semibold"
              style={{
                width: '50px',
                height: '50px',
                padding: 0,
                marginBottom: 0
              }}
            />
          ))}
        </div>

        <button className="btn-primary w-full py-3 mb-2 font-semibold text-sm" onClick={submit}>
          Verify OTP
        </button>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-slate-400 text-sm" style={{ margin: 0 }}>Resend OTP in <span className="text-emerald-400 font-semibold">{timer}s</span></p>
          ) : (
            <button className="btn-outline w-full py-2" onClick={() => setTimer(30)}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
