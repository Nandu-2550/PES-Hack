const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).send('Text required');
  try {
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${lang || 'kn'}&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google TTS returned ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('TTS Proxy Error:', err);
    res.status(500).send('TTS Error');
  }
});

module.exports = router;
