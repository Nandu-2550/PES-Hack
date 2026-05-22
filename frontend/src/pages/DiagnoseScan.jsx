import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import PlantSelector from '../components/PlantSelector';
import axios from 'axios';
import { saveScanLog, getUnsyncedLogs } from '../db/localForage';
import { classifyImage, loadModel } from '../ai/cropClassifier';
import { Camera, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';

const DiagnoseScan = () => {
  const [step, setStep] = useState('intro');
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pendingLogs, setPendingLogs] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Warm up the TF.js model in the background
    loadModel();

    // Intro animation timer
    const introTimer = setTimeout(() => {
      setStep(1);
    }, 2500);

    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {

    // Check for pending logs on mount
    getUnsyncedLogs().then(logs => setPendingLogs(logs.length));

    const handleOnline = () => {
      // Sync is handled by App.jsx, but we update UI count here
      setTimeout(() => setPendingLogs(0), 2000);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handlePartSelect = (part) => {
    setSelectedPart(part);
    if (part !== 'Leaf') {
      toast.error(`${part} analysis coming soon! Please select Leaf.`);
      setSelectedPart(null);
    }
  };

  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    setStep(2);
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const diagnose = async () => {
    if (!imageFile) {
      toast.error("Please capture or select an image.");
      return;
    }

    setLoading(true);
    let diagResult;
    const imgElement = document.getElementById('preview-img');

    if (navigator.onLine) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("crop", selectedCrop);
        formData.append("part", selectedPart);

        const res = await axios.post("/diagnose", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        diagResult = { ...res.data, runMode: 'server' };
      } catch (err) {
        console.error(err);
        toast.error("Cloud AI failed. Falling back to On-Device AI.");
        diagResult = await classifyImage(imgElement, selectedCrop);
      }
    } else {
      diagResult = await classifyImage(imgElement, selectedCrop);
    }

    setResult(diagResult);

    await saveScanLog({
      id: Date.now().toString(),
      crop: selectedCrop,
      part: selectedPart,
      result: diagResult,
      imageDataUrl: imgElement.src,
      scannedAt: new Date().toISOString(),
      synced: navigator.onLine
    });

    if (!navigator.onLine) {
      toast.success("Scanned offline. Log saved.");
      const logs = await getUnsyncedLogs();
      setPendingLogs(logs.length);
    }
    
    setLoading(false);
  };

  const reset = () => {
    setStep(1);
    setSelectedPart(null);
    setSelectedCrop(null);
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="page-container">
      <h1 className="mb-2">AI Diagnosis</h1>
      
      {step === 'intro' && (
        <div className="surface-card flex-col items-center justify-center" style={{ height: '300px' }}>
          <style>
            {`
              @keyframes scan-line {
                0% { transform: translateY(-50px); opacity: 0; }
                50% { opacity: 1; filter: drop-shadow(0 0 10px var(--accent-color)); }
                100% { transform: translateY(50px); opacity: 0; }
              }
              @keyframes pulse-ring {
                0% { transform: scale(0.8); opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
              }
            `}
          </style>
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', width: '100%', height: '100%', 
              borderRadius: '50%', border: '4px solid var(--accent-color)',
              animation: 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
            }} />
            <Camera size={40} color="var(--accent-color)" />
            <div style={{
              position: 'absolute', width: '120%', height: '4px',
              background: 'var(--accent-color)',
              animation: 'scan-line 2s linear infinite'
            }} />
          </div>
          <h2 className="mt-2" style={{ color: 'var(--accent-color)' }}>Initializing Scanner...</h2>
          <p className="mt-1" style={{ fontSize: '14px' }}>Loading on-device ML models</p>
        </div>
      )}

      {pendingLogs > 0 && step !== 'intro' && (
        <div style={{ backgroundColor: '#B8860B', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} />
          <span>{pendingLogs} offline scan(s) pending sync</span>
        </div>
      )}

      {step === 1 && (
        <div className="surface-card flex-col items-center">
          <h2 className="mb-2 text-center">Select Plant Part</h2>
          <PlantSelector onSelectPart={handlePartSelect} selectedPart={selectedPart} />
          
          {selectedPart === 'Leaf' && (
            <div className="w-full mt-2" style={{ width: '100%' }}>
              <h3 className="mb-2 text-center">Select Crop</h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {['Sugarcane', 'Paddy', 'Tomato'].map(crop => (
                  <button 
                    key={crop}
                    className="btn-secondary"
                    style={{ width: 'auto', padding: '8px 16px' }}
                    onClick={() => handleCropSelect(crop)}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && !result && (
        <div className="surface-card flex-col items-center text-center">
          <h2 className="mb-2">Capture Image</h2>
          <p className="mb-3">Take a clear photo of the {selectedCrop} {selectedPart}.</p>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageCapture}
          />
          
          {previewUrl ? (
            <div className="mb-3">
              <img id="preview-img" src={previewUrl} alt="preview" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', border: '2px solid var(--accent-color)' }} />
            </div>
          ) : (
            <div className="flex gap-4 w-full justify-center mb-3">
              <button 
                className="btn-secondary flex flex-col items-center justify-center gap-2"
                style={{ width: '100px', height: '100px' }}
                onClick={() => fileInputRef.current.click()}
              >
                <Camera size={32} />
                <span>Camera</span>
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="flex w-full gap-2">
              <button className="btn-secondary" onClick={() => setPreviewUrl(null)}>Retake</button>
              <button className="btn-primary" onClick={diagnose} disabled={loading}>
                {loading ? 'Analyzing...' : 'Diagnose Now'}
              </button>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="surface-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle color="var(--accent-color)" size={24} />
              <h2 style={{ margin: 0 }}>Analysis Complete</h2>
            </div>
            {result.runMode && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 10,
                background: result.runMode === 'server' ? 'rgba(82,183,136,0.2)' : 'rgba(244,162,97,0.2)',
                color: result.runMode === 'server' ? '#52b788' : '#f4a261'
              }}>
                {result.runMode === 'server' ? '☁ Cloud AI' : '📱 On-Device AI'}
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <p><strong>Detected:</strong> <span style={{ color: 'var(--text-highlight)' }}>{result.disease}</span></p>
            <p><strong>Confidence:</strong> {Math.round(result.confidence * 100)}%</p>
            <p>
              <strong>Severity:</strong> 
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px', 
                borderRadius: '12px', 
                backgroundColor: result.severity === 'High' ? '#8b0000' : result.severity === 'Medium' ? '#b8860b' : 'var(--primary-color)',
                fontSize: '12px'
              }}>
                {result.severity}
              </span>
            </p>
          </div>

          <div style={{ backgroundColor: '#0d1f15', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
            <h4 className="mb-1">Recommended Action</h4>
            <p style={{ fontSize: '14px' }}>{result.action}</p>
          </div>

          <button className="btn-primary mt-2" onClick={reset}>Scan Another</button>
        </div>
      )}

    </div>
  );
};

export default DiagnoseScan;
