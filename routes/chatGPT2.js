const GPTModel = require('../models/GPT');
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const config = require('../config');
const configuration = new Configuration({
  apiKey: config.API_KEY,
});
const openai = new OpenAIApi(configuration);

router.get('/chat2', isLoggedIn, async (req, res) => {
  try {
    const previousResponses = await GPTModel.find({ userId: req.user._id });
    res.render("chat2/new");
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching previous responses. Please try again later.');
  }
});

// Get the prompt and input message from new.ejs
// Sending message to GPT to generate output
// Save the output into database to call later.
router.post('/chat2', isLoggedIn, async (req, res) => {
  const {inputPrompt, inputText} = req.body;
  try {
    console.log('Sending request to OpenAI API...');
    const result = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${inputPrompt} : ${inputText}`,
      max_tokens: 1024,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    // generated output
    const generatedParagraph = result.data.choices[0].text.trim();
    
    const gptResponse = new GPTModel({
      prompt: inputPrompt,
      input: inputText,
      output: generatedParagraph,
      userId: req.user._id,
    });

    await gptResponse.save();

    res.render('chat2/output', { paragraph: generatedParagraph });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating paragraph. Please try again later.');
  }
});

router.get('/history', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await GPTModel.find({ userId: userId }).sort({ _id: -1 });
    res.render('chat2/history', { chats });
  } catch (error) {
    res.status(500).send('Error retrieving chat history');
  }
});

router.get('/history/byPrompt', async (req, res) => {
  try {
    const userId = req.user._id;
    const uniquePrompts = await GPTModel.distinct('prompt', { userId: userId });
    res.render('chat2/groupByPrompt', { uniquePrompts });
  } catch (error) {
    res.status(500).send('Error retrieving unique prompts');
  }
});

router.get('/history/chatByPrompt/:group', async (req, res) => {
  try {
    const userId = req.user._id;
    const group = req.params.group;
    const chats = await GPTModel.find({ userId: userId, prompt: group });
    res.render('chat2/chatsByPrompt', { chats, group });
  } catch (error) {
    res.status(500).send('Error retrieving chats by prompt');
  }
});

module.exports = router;