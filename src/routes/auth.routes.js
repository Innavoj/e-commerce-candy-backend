const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   POST /api/auth/register
// @desc    Register a new customer
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate customer & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current logged-in customer details
// @access  Private (requires token)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
