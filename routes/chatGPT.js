const GPTModel = require('../models/GPT');
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const config = require('../config');

const configuration = new Configuration({
  apiKey: config.API_KEY,
});
const openai = new OpenAIApi(configuration);

router.get('/generate-paragraph', async (req, res) => {
  try {
    const previousResponses = await GPTModel.find({ userId: req.user._id }); // Assuming 'req.user' contains the logged-in user information
    res.render('generate-paragraph', { previousResponses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching previous responses. Please try again later.');
  }
});

router.post('/generate-paragraph', async (req, res) => {
  const topic = req.body.topic;

  try {
    console.log('Sending request to OpenAI API...');
    const result = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Write a paragraph about ${topic}`,
      //prompt: 'Write a paragraph about spring water',
      max_tokens: 1024,
      n: 1,
      stop: null,
      temperature: 0.7,
    });
    //console.log(result);

    const generatedParagraph = result.data.choices[0].text.trim();
    console.log(generatedParagraph);
    // Save the user response to the database
    
    const gptResponse = new GPTModel({
      prompt: `Write a paragraph about ${topic}`,
      input: topic,
      output: generatedParagraph,
      userId: req.user._id, // Assuming 'req.user' contains the logged-in user information
    });

    await gptResponse.save();

    res.render('generated-paragraph', { paragraph: generatedParagraph });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating paragraph. Please try again later.');
  }
});
module.exports = router;