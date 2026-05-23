import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';

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
 *
 * Writes two keys consumed by ProtectedRoute:
 *  - `userToken`   — JWT bearer token (or any opaque session token)
 *  - `userProfile` — lightweight user object (name, state, district)
 *
 * Also mirrors to the AuthContext keys (agrishield_token / agrishield_user)
 * so the existing context-based components continue to work.
 *
 * Throws a descriptive Error on storage quota failure so the caller can
 * surface it gracefully.
 */
const persistSession = (token, user) => {
  try {
    // Keys required by ProtectedRoute (offline route guard)
    localStorage.setItem('userToken', token);
    localStorage.setItem('userProfile', JSON.stringify({
      name: user.name,
      state: user.state,
      district: user.district,
    }));

    // Mirror to existing AuthContext keys — keeps context-based reads consistent
    localStorage.setItem('agrishield_token', token);
    localStorage.setItem('agrishield_user', JSON.stringify(user));
  } catch (storageErr) {
    // Likely a QuotaExceededError — translate to user-friendly message
    const isQuota =
      storageErr instanceof DOMException &&
      (storageErr.code === 22 ||
        storageErr.code === 1014 ||
        storageErr.name === 'QuotaExceededError' ||
        storageErr.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    throw new Error(
      isQuota
        ? 'Your device storage is full. Please free up space and try again.'
        : 'Could not save your session locally. Please try again.'
    );
  }
};

const Onboarding = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    // Reset district if state changes
    if (e.target.name === 'state') {
      setFormData(prev => ({ ...prev, district: statesData[e.target.value][0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const payload = formData.identifier.includes('@')
          ? { email: formData.identifier, password: formData.password }
          : { phone: formData.identifier, password: formData.password };

        const response = await login(payload);

        // Persist session to localStorage before navigating.
        // Both writes must succeed; any storage error is surfaced to the user.
        persistSession(response.data.token, response.data.user);

        toast.success("Welcome back!");
        navigate('/dashboard');
      } else {
        const response = await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          state: formData.state,
          district: formData.district
        });

        // Persist immediately on registration as well, before OTP modal
        persistSession(response.data.token, response.data.user);

        toast.success("Registration successful! Verify OTP.");
        setShowOTP(true);
      }
    } catch (err) {
      // Surface storage quota errors and auth errors the same way
      const message =
        err.message && !err.response
          ? err.message // Our own persistSession error
          : (err.response?.data?.errors?.[0]?.msg || "An error occurred");
      toast.error(message);
    }
  };

  const handleVerifyOTP = (code) => {
    setShowOTP(false);
    toast.success("OTP Verified!");
    navigate('/dashboard');
  };

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-screen bg-[#0B0F12] text-slate-200 px-4 py-8">
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-glow-md mb-3 animate-pulse">
          <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight">AgriShield</h1>
      </div>

      <div className="card w-full max-w-md p-8 shadow-glow-lg border border-white/5 relative z-10">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text" name="name" placeholder="Full Name" required
              value={formData.name} onChange={handleChange}
              className="input-field mb-4"
            />
          )}

          {isLogin ? (
            <input
              type="text" name="identifier" placeholder="Email or Phone Number" required
              value={formData.identifier} onChange={handleChange}
              className="input-field mb-4"
            />
          ) : (
            <>
              <input
                type="email" name="email" placeholder="Email Address (Optional)"
                value={formData.email} onChange={handleChange}
                className="input-field mb-4"
              />
              <input
                type="tel" name="phone" placeholder="Phone Number" required
                pattern="[0-9]{10}" title="10 digit phone number"
                value={formData.phone} onChange={handleChange}
                className="input-field mb-4"
              />
            </>
          )}

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password" placeholder="Password" required minLength="6"
              value={formData.password} onChange={handleChange}
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                required
                className="input-field"
              >
                {statesList.map(s => <option key={s} value={s} className="bg-[#13191C]">{s}</option>)}
              </select>
              <select 
                name="district" 
                value={formData.district} 
                onChange={handleChange} 
                required
                className="input-field"
              >
                {currentDistricts.map(d => <option key={d} value={d} className="bg-[#13191C]">{d}</option>)}
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3.5 font-bold mb-4 mt-2">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold transition-colors ml-1"
            onClick={() => { setIsLogin(!isLogin); setFormData({ ...formData, password: '' }); }}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>

      <OTPModal isOpen={showOTP} phone={formData.phone} onVerify={handleVerifyOTP} />
    </div>
  );
};

export default Onboarding;
