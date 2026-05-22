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

const Onboarding = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // Used for login (email or phone)
    phone: '', // Used for register
    email: '', // Used for register (optional)
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
        await login(payload);
        toast.success("Welcome back!");
        navigate('/dashboard');
      } else {
        await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          state: formData.state,
          district: formData.district
        });
        toast.success("Registration successful! Verify OTP.");
        setShowOTP(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || "An error occurred");
    }
  };

  const handleVerifyOTP = (code) => {
    setShowOTP(false);
    toast.success("OTP Verified!");
    navigate('/dashboard');
  };

  return (
    <div className="page-container flex-col items-center justify-center" style={{ minHeight: '100vh', paddingBottom: 0 }}>
      <h1 className="mb-3 text-center" style={{ fontSize: '32px' }}>AgriShield AI</h1>
      
      <div className="surface-card w-full" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <h2 className="mb-3">{isLogin ? 'Login' : 'Register'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" name="name" placeholder="Full Name" required 
              value={formData.name} onChange={handleChange} 
            />
          )}
          
          {isLogin ? (
            <input 
              type="text" name="identifier" placeholder="Email or Phone Number" required 
              value={formData.identifier} onChange={handleChange} 
            />
          ) : (
            <>
              <input 
                type="email" name="email" placeholder="Email Address (Optional)" 
                value={formData.email} onChange={handleChange} 
              />
              <input 
                type="tel" name="phone" placeholder="Phone Number" required 
                pattern="[0-9]{10}" title="10 digit phone number"
                value={formData.phone} onChange={handleChange} 
              />
            </>
          )}
          
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" placeholder="Password" required minLength="6"
              value={formData.password} onChange={handleChange} 
              style={{ paddingRight: '40px' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '12px',
                background: 'none', border: 'none', color: 'var(--text-secondary)'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLogin && (
            <>
              <select name="state" value={formData.state} onChange={handleChange} required>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select name="district" value={formData.district} onChange={handleChange} required>
                {currentDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </>
          )}

          <button type="submit" className="btn-primary mb-2">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-2">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }} 
            onClick={() => { setIsLogin(!isLogin); setFormData({...formData, password: ''}); }}
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
