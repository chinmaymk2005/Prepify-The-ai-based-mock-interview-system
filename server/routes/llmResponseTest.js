const express = require('express');
const router = express.Router();
const { testLLMResponse } = require('../controllers/llmController');

router.post('/test-llm', testLLMResponse);

module.exports = router;