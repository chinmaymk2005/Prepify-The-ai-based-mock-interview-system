const express = require('express');
const { signup, login } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Example protected route
router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

module.exports = router;
