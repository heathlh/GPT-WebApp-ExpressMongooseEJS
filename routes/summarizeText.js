const GPTModel = require('../models/GPT');
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const config = require('../config');

const configuration = new Configuration({
  apiKey: config.API_KEY,
});
const openai = new OpenAIApi(configuration);
router.get('/summarize-text', async (req, res) => {
    res.render('summarize-text/new', { summary: '' });
  });  


router.post('/summarize-text', async (req, res) => {
  const text = req.body.text;

  try {
    console.log('Sending request to OpenAI API...');
    const result = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `Summarize the following text:\n\n${text}`,
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.5,
    });

    const summary = result.data.choices[0].text.trim();

    res.render('summarize-text/new', { summary });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error summarizing text. Please try again later.');
  }
});

module.exports = router;
