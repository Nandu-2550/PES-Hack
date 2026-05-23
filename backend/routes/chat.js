const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper to delay execution
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to execute REST calls with retries and backoff on 429 Rate Limits
async function callApiWithRetry(url, payload, headers, retries = 3, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post(url, payload, { headers });
      return res;
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 && i < retries - 1) {
        const waitTime = delay * (i + 1);
        console.warn(`[Chat API] 429 Rate limited. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await wait(waitTime);
        continue;
      }
      throw err;
    }
  }
}

// POST /api/chat — Handle farming voice assistant conversation prompts
router.post('/', async (req, res) => {
  const { messages, systemPrompt, language } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages payload' });
  }

  try {
    let responseText = "";

    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key') {
      // 1. Claude Messages API
      const response = await callApiWithRetry(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        },
        {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      );
      responseText = response.data.content[0].text;

    } else if (process.env.GEMINI_API_KEY) {
      // 2. Gemini API (gemini-2.5-flash)
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      ];

      const response = await callApiWithRetry(
        url,
        { contents },
        { 'Content-Type': 'application/json' }
      );
      responseText = response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No AI API keys configured (ANTHROPIC_API_KEY or GEMINI_API_KEY)');
    }

    return res.json({ response: responseText });
  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
