import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Voice command vocabulary per language
const COMMAND_MAP = {
  en: {
    'open dashboard': '/', 'go home': '/', 'home': '/',
    'diagnose': '/diagnose', 'scan crop': '/diagnose', 'scan': '/diagnose',
    'jobs': '/jobs', 'find jobs': '/jobs', 'work': '/jobs',
    'machinery': '/machinery', 'machines': '/machinery',
    'weather': '/weather', 'forecast': '/weather',
    'market': '/market', 'crop market': '/market', 'sell crops': '/market',
    'schemes': '/schemes', 'government schemes': '/schemes',
    'loans': '/loans', 'crop loans': '/loans',
  },
  kn: {
    'ಮುಖಪುಟ': '/', 'ಡ್ಯಾಶ್ಬೋರ್ಡ್': '/',
    'ರೋಗ ಪತ್ತೆ': '/diagnose', 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್': '/diagnose',
    'ಕೆಲಸ': '/jobs', 'ಯಂತ್ರ': '/machinery',
    'ಹವಾಮಾನ': '/weather', 'ಮಾರುಕಟ್ಟೆ': '/market',
    'ಯೋಜನೆ': '/schemes', 'ಸಾಲ': '/loans',
  },
  hi: {
    'होम': '/', 'डैशबोर्ड': '/', 'मुखपृष्ठ': '/',
    'जाँच': '/diagnose', 'फसल स्कैन': '/diagnose',
    'काम': '/jobs', 'मशीन': '/machinery',
    'मौसम': '/weather', 'बाज़ार': '/market',
    'योजना': '/schemes', 'ऋण': '/loans',
  },
};

const LANG_TO_BCP = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };

export function useVoiceBot(lang = 'en') {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recogRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = LANG_TO_BCP[lang] || 'en-IN';
    window.speechSynthesis.speak(utt);
  }, [lang]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_TO_BCP[lang] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const results = Array.from(event.results[0]).map((r) => r.transcript.toLowerCase().trim());
      setTranscript(results[0]);

      const commandMap = { ...COMMAND_MAP.en, ...(COMMAND_MAP[lang] || {}) };

      let matched = null;
      for (const result of results) {
        for (const [cmd, path] of Object.entries(commandMap)) {
          if (result.includes(cmd.toLowerCase())) {
            matched = path;
            break;
          }
        }
        if (matched) break;
      }

      if (matched) {
        speak(lang === 'kn' ? 'ತೆರೆಯಲಾಗುತ್ತಿದೆ' : lang === 'hi' ? 'खोल रहे हैं' : 'Opening...');
        setTimeout(() => navigate(matched), 800);
      } else {
        speak(lang === 'kn' ? 'ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : lang === 'hi' ? 'समझ नहीं आया। फिर प्रयास करें।' : 'Command not recognized. Please try again.');
      }
    };

    recognition.onerror = () => setListening(false);
    recogRef.current = recognition;
    recognition.start();
  }, [lang, navigate, speak]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, transcript, startListening, stopListening };
}
