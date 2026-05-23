import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mic, MicOff, X, Volume2, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

const SYSTEM_PROMPT = `You are AgriShield Assistant, a helpful AI for Indian farmers, 
especially those in Karnataka. You help with:
- Crop disease diagnosis and treatment
- Weather advice for farming
- Government schemes and loans
- Job and machinery marketplace
- Mandi prices and market information
- General farming tips

Respond in the same language the user speaks. If they speak in Kannada, respond in Kannada.
If Hindi, respond in Hindi. If English, respond in English.
Keep responses concise and practical for farmers. Use simple language.`;

const LANG_CODES = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };

export default function VoiceBot() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { t, lang } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  
  const speechLang = LANG_CODES[lang] || 'en-IN';

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        handleUserSpeech(text);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        setError('Network error. Check your internet connection.');
      } else {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang, speechLang]);

  // Handle user speech — send to API
  const handleUserSpeech = useCallback(async (userText) => {
    if (!userText.trim()) return;
    if (isThinking) return; // Prevent multiple requests if one is already in progress

    setIsThinking(true);
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    try {
      const res = await client.post('/api/chat', {
        messages: newMessages,
        systemPrompt: SYSTEM_PROMPT,
        language: lang,
      });

      const aiResponse = res.data.response;

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setResponse(aiResponse);
      setIsThinking(false);

      // Speak the response
      speakResponse(aiResponse);

    } catch (err) {
      console.error('Chat API error:', err);
      setIsThinking(false);
      setError('Failed to get AI response. Please try again.');
    }
  }, [messages, lang, isThinking]); // Add isThinking to dependency array

  // Text-to-Speech
  const speakResponse = (text) => {
    if (!synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use a matching voice if possible
    const voices = synthRef.current.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (synthRef.current?.speaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current?.start();
      } catch (err) {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 200);
      }
    }
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  const clearConversation = () => {
    setMessages([]);
    setTranscript('');
    setResponse('');
    stopSpeaking();
  };

  // Guard routing check
  if (!user || location.pathname === '/') return null;

  return (
    <>
      {/* Floating Mic Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isListening ? '#ef4444' : 'linear-gradient(135deg, #10B981, #059669)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isListening ? '0 0 24px rgba(239,68,68,0.5)' : '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 1000,
          animation: isListening ? 'agri-pulse 1s infinite' : 'none',
          transition: 'all 0.2s',
        }}
        aria-label={t('voice_bot')}
      >
        <Mic color="white" size={22} />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '145px',
          right: '16px',
          width: '300px',
          maxHeight: '450px',
          background: '#13191C',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#0B0F12', fontSize: '14px' }}>🌾 {t('voice_bot')}</strong>
              <p style={{ color: '#0B0F12cc', fontSize: '11px', margin: 0, fontWeight: 500 }}>Voice Assistant — Any language</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#0B0F12', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>×</button>
          </div>

          {/* Messages Console */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                {lang === 'kn' ? 'ಮಾತನಾಡಲು ಕೆಳಗಿನ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿರಿ ಮತ್ತು ಕೃಷಿ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ!' : lang === 'hi' ? 'बोलने के लिए नीचे दिए गए माइक बटन को दबाएं और खेती के बारे में कुछ भी पूछें!' : 'Press the mic button below and ask me anything about farming!'}
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                background: msg.role === 'user' ? 'rgba(16,185,129,0.15)' : '#1A2228',
                color: msg.role === 'user' ? '#10B981' : '#e2e8f0',
                border: msg.role === 'user' ? '1px solid rgba(16,185,129,0.25)' : '1px solid border-white/5',
                fontSize: '12px',
                lineHeight: '1.4',
              }}>
                {msg.content}
              </div>
            ))}
            {isThinking && (
              <div style={{ alignSelf: 'flex-start', color: '#10B981', fontSize: '12px', paddingLeft: '4px' }}>
                Thinking...
              </div>
            )}
            {error && (
              <div style={{ color: '#f87171', fontSize: '11px', textAlign: 'center' }}>{error}</div>
            )}
          </div>

          {/* Transcript preview */}
          {transcript && (
            <div style={{ padding: '8px 16px', background: '#1A2228', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#10B981', fontSize: '11px' }}>
              Heard: "{transcript}"
            </div>
          )}

          {/* Controls Panel */}
          <div style={{ padding: '12px', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={toggleListening}
              disabled={isThinking}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: isListening ? '#dc2626' : 'linear-gradient(135deg, #10B981, #059669)',
                color: isListening ? '#fff' : '#0B0F12',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? 'Stop' : 'Speak'}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center' }}
              >
                <Volume2 size={14} />
              </button>
            )}
            <button
              onClick={clearConversation}
              style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px' }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes agri-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
      `}</style>
    </>
  );
}
