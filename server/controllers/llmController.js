exports.testLLMResponse = async (req, res) => {
    try {
        const { prompt } = req.body;
        // Your LLM response logic here
        res.json({ response: "This is a test response" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};