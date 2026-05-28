import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf, MapPin, Lock, Mail, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';
import ProgressButton from '../components/ui/ProgressButton';

const statesData = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng"],
  "Assam": ["Baksa", "Barpeta", "Biswanath"],
  "Bihar": ["Araria", "Arwal", "Aurangabad"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar"],
  "Karnataka": [
    "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
    "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya",
    "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi",
    "Uttara Kannada", "Vijayapura", "Yadgir", "Vijayanagara"
  ],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima"],
  "Odisha": ["Angul", "Balangir", "Balasore"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad"],
  "Tripura": ["Dhalai", "Gomati", "Khowai"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum"]
};

const statesList = Object.keys(statesData);

/**
 * Persist session data to localStorage immediately after successful auth.
 * Writes two keys consumed by ProtectedRoute: `userToken` and `userProfile`.
 * Also mirrors to AuthContext keys (agrishield_token / agrishield_user).
 */
const persistSession = (token, user) => {
  try {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userProfile', JSON.stringify({
      name: user.name, state: user.state, district: user.district,
    }));
    localStorage.setItem('agrishield_token', token);
    localStorage.setItem('agrishield_user', JSON.stringify(user));
  } catch (storageErr) {
    const isQuota =
      storageErr instanceof DOMException &&
      (storageErr.code === 22 || storageErr.code === 1014 ||
        storageErr.name === 'QuotaExceededError' ||
        storageErr.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    throw new Error(
      isQuota
        ? 'Your device storage is full. Please free up space and try again.'
        : 'Could not save your session locally. Please try again.'
    );
  }
};

const formVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.30, ease: 'easeOut' } },
  exit: { opacity: 0, x: -18, transition: { duration: 0.18 } },
};

const inputStyle = {
  background: 'rgba(0,0,0,0.32)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 12,
  color: '#fff',
  padding: '11px 16px',
  width: '100%',
  outline: 'none',
  fontSize: 14,
  marginBottom: 0,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

const InputField = ({ icon: Icon, style: extraStyle = {}, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
    )}
    <input
      {...props}
      style={{ ...inputStyle, paddingLeft: Icon ? 40 : 16, ...extraStyle }}
      onFocus={e => { e.target.style.borderColor = 'rgba(52,211,153,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.10)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
    />
  </div>
);

const Onboarding = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldError, setFieldError] = useState({ email: '', phone: '' });
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // Used for login (email or phone)
    phone: '',      // Used for register
    email: '',      // Used for register (optional)
    password: '',
    state: 'Karnataka',
    district: 'Mandya'
  });

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentDistricts = statesData[formData.state] || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'state') {
      setFormData(prev => ({ ...prev, district: statesData[e.target.value][0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setSubmitSuccess(false);
    setFieldError({ email: '', phone: '' });
    try {
      if (isLogin) {
        const payload = formData.identifier.includes('@')
          ? { email: formData.identifier, password: formData.password }
          : { phone: formData.identifier, password: formData.password };
        const response = await login(payload);
        persistSession(response.data.token, response.data.user);
        setSubmitSuccess(true);
        toast.success("Welcome back!");
        setSubmitting(false);
        setTimeout(() => navigate('/dashboard'), 600);
      } else {
        const response = await register({
          name: formData.name,
          phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`,
          email: formData.email,
          password: formData.password,
          state: formData.state,
          district: formData.district
        });
        persistSession(response.data.token, response.data.user);
        setSubmitSuccess(true);
        toast.success("Registration successful! Verify OTP.");
        setSubmitting(false);
        setTimeout(() => setShowOTP(true), 400);
      }
    } catch (err) {
      setSubmitting(false); setSubmitSuccess(false);
      const message =
        err.message && !err.response
          ? err.message
          : (err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || "Invalid details. Please try again.");
      if (message.toLowerCase().includes('email')) setFieldError(prev => ({ ...prev, email: message }));
      else if (message.toLowerCase().includes('phone')) setFieldError(prev => ({ ...prev, phone: message }));
      toast.error(message);
    }
  };

  const handleVerifyOTP = (code) => {
    setShowOTP(false);
    toast.success("OTP Verified!");
    navigate('/dashboard');
  };

  const selectStyle = {
    ...inputStyle,
    background: 'rgba(0,0,0,0.45)',
    cursor: 'pointer',
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">

      {/* Ambient orbs — purely decorative z-0 */}
      <div className="nfv-orb nfv-orb-emerald nfv-orb-animate-1" style={{ width: 450, height: 450, top: '-12%', left: '-18%', zIndex: 0, opacity: 0.22 }} aria-hidden="true" />
      <div className="nfv-orb nfv-orb-teal nfv-orb-animate-2" style={{ width: 340, height: 340, bottom: '4%', right: '-12%', zIndex: 0, opacity: 0.18 }} aria-hidden="true" />

      {/* Logo + wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center mb-8 z-10"
      >
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          background: 'rgba(52,211,153,0.15)',
          border: '1px solid rgba(52,211,153,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
          boxShadow: '0 0 28px rgba(52,211,153,0.22)',
        }}>
          <Leaf size={32} color="#34D399" />
        </div>
        <h1 className="text-white text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
          AgriShield
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', animation: 'pulse 2s infinite' }} />
          <span style={{ color: 'rgba(52,211,153,0.70)', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
            Karnataka · Hassan · Mandya · Mysore
          </span>
        </div>
      </motion.div>

      {/* Glass form card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
        style={{
          background: 'rgba(26,36,33,0.52)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        }}
      >
        {/* Tab dock */}
        <div className="tab-dock mb-6">
          <button type="button" className={`tab-pill ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setFormData(p => ({ ...p, password: '' })); setSubmitSuccess(false); }}>
            Sign In
          </button>
          <button type="button" className={`tab-pill ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setFormData(p => ({ ...p, password: '' })); setSubmitSuccess(false); }}>
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            variants={formVariants} initial="hidden" animate="visible" exit="exit"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {/* Full Name (register only) */}
            {!isLogin && (
              <InputField type="text" name="name" placeholder="Full Name" required
                icon={User} value={formData.name} onChange={handleChange} />
            )}

            {/* Identifier (login) or email + phone (register) */}
            {isLogin ? (
              <InputField type="text" name="identifier" placeholder="Email or Phone Number" required
                icon={Mail} value={formData.identifier} onChange={handleChange} />
            ) : (
              <>
                <InputField type="email" name="email" placeholder="Email Address (Optional)"
                  icon={Mail} value={formData.email} onChange={handleChange}
                  style={{ borderColor: fieldError.email ? 'rgba(239,68,68,0.55)' : undefined }} />
                {fieldError.email && <p style={{ color: '#F87171', fontSize: 11, marginTop: -8, paddingLeft: 4 }}>{fieldError.email}</p>}

                <InputField type="tel" name="phone" placeholder="Phone Number" required
                  pattern="[0-9]{10}" title="10 digit phone number"
                  icon={Phone} value={formData.phone} onChange={handleChange}
                  style={{ borderColor: fieldError.phone ? 'rgba(239,68,68,0.55)' : undefined }} />
                {fieldError.phone && <p style={{ color: '#F87171', fontSize: 11, marginTop: -8, paddingLeft: 4 }}>{fieldError.phone}</p>}
              </>
            )}

            {/* Password */}
            <div className="relative">
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? "text" : "password"}
                name="password" placeholder="Password" required minLength="6"
                value={formData.password} onChange={handleChange}
                style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                onFocus={e => { e.target.style.borderColor = 'rgba(52,211,153,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.10)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* State + District (register only) */}
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="nfv-label">State</label>
                  <select name="state" value={formData.state} onChange={handleChange} required style={selectStyle}>
                    {statesList.map(s => <option key={s} value={s} style={{ background: '#0d1a14' }}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nfv-label">District</label>
                  <select name="district" value={formData.district} onChange={handleChange} required style={selectStyle}>
                    {currentDistricts.map(d => <option key={d} value={d} style={{ background: '#0d1a14' }}>{d}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ProgressButton submit */}
            <ProgressButton isLoading={submitting} isSuccess={submitSuccess} className="w-full py-3.5 text-base mt-1">
              {isLogin ? 'Sign In' : 'Create Account'}
            </ProgressButton>
          </motion.form>
        </AnimatePresence>

        {/* Toggle link */}
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            style={{ color: '#34D399', fontWeight: 600, cursor: 'pointer', marginLeft: 6, transition: 'color 0.2s' }}
            onClick={() => { setIsLogin(!isLogin); setFormData(p => ({ ...p, password: '' })); setSubmitSuccess(false); }}
            onMouseEnter={e => e.target.style.color = '#6ee7b7'}
            onMouseLeave={e => e.target.style.color = '#34D399'}
          >
            {isLogin ? 'Register' : 'Sign In'}
          </span>
        </p>
      </motion.div>

      <OTPModal isOpen={showOTP} phone={formData.phone} onVerify={handleVerifyOTP} />
    </div>
  );
};

export default Onboarding;

