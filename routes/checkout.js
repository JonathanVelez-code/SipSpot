const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const checkout = require('../controllers/checkout');

// Create Checkout Session
router.post('/', catchAsync(checkout.createCheckoutSession));

// Success page
router.get('/success', checkout.checkoutSuccess);

module.exports = router;
